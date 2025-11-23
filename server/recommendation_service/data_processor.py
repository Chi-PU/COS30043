import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

class DataProcessor:
    def __init__(self):
        self.conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', '5432')
        )
    
    def get_ratings_data(self, min_ratings=10):
        """
        Fetch ratings data from PostgreSQL
        min_ratings: minimum number of ratings a user should have
        """
        query = """
        SELECT 
            r.user_id,
            r.product_id,
            r.rating::FLOAT as rating
        FROM reviews r
        WHERE r.user_id IN (
            SELECT user_id 
            FROM reviews 
            GROUP BY user_id 
            HAVING COUNT(*) >= %s
        )
        ORDER BY r.user_id, r.product_id
        """
        
        with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (min_ratings,))
            data = cursor.fetchall()
        
        if len(data) == 0:
            print(f"No users found with at least {min_ratings} ratings")
            return None
            
        df = pd.DataFrame(data)
        
        # Ensure rating column is numeric
        df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
        df = df.dropna(subset=['rating'])
        
        print(f"Loaded {len(df)} ratings from {df['user_id'].nunique()} users and {df['product_id'].nunique()} products")
        return df
    
    def create_interaction_matrix(self, df):
        """
        Create user-product interaction matrix
        """
        # Create pivot table
        interaction_matrix = df.pivot(
            index='user_id',
            columns='product_id',
            values='rating'
        ).fillna(0)
        
        # Ensure all values are numeric
        interaction_matrix = interaction_matrix.astype(np.float32)
        
        # Convert to sparse matrix for efficiency
        sparse_matrix = csr_matrix(interaction_matrix.values)
        
        return interaction_matrix, sparse_matrix
    
    def get_product_details(self, product_ids):
        """
        Get product details for recommended products
        """
        query = """
        SELECT 
            id,
            name,
            description,
            price,
            discount,
            image_url,
            category,
            stock,
            CASE 
                WHEN number_of_ratings > 0 
                THEN ROUND(CAST(total_rating_score AS DECIMAL) / number_of_ratings, 2)
                ELSE 0 
            END as average_rating,
            number_of_ratings
        FROM products
        WHERE id = ANY(%s)
        """
        
        with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (list(product_ids),))
            products = cursor.fetchall()
        
        return products
    
    def close(self):
        self.conn.close()