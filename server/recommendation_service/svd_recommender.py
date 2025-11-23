import numpy as np
import pandas as pd
from scipy.sparse.linalg import svds
from scipy.sparse import csr_matrix

class SVDRecommender:
    def __init__(self, k=50):
        """
        Initialize SVD Recommender
        k: number of latent features
        """
        self.k = k
        self.U = None
        self.sigma = None
        self.Vt = None
        self.interaction_matrix = None
        self.predictions_matrix = None
        self.user_ids = None
        self.product_ids = None
    
    def fit(self, interaction_matrix, sparse_matrix):
        """
        Train the SVD model
        """
        self.interaction_matrix = interaction_matrix
        self.user_ids = interaction_matrix.index.tolist()
        self.product_ids = interaction_matrix.columns.tolist()
        
        # Perform SVD with appropriate k value
        k = min(self.k, min(sparse_matrix.shape) - 1)
        print(f"Training SVD with k={k} latent features...")
        
        self.U, s, self.Vt = svds(sparse_matrix, k=k)
        
        # Construct diagonal matrix
        self.sigma = np.diag(s)
        
        # Generate predictions
        all_user_predicted_ratings = np.dot(np.dot(self.U, self.sigma), self.Vt)
        
        # Convert to DataFrame
        self.predictions_matrix = pd.DataFrame(
            np.abs(all_user_predicted_ratings),
            columns=self.product_ids,
            index=self.user_ids
        )
        
        print(f"Model trained successfully for {len(self.user_ids)} users and {len(self.product_ids)} products")
        return self
    
    def recommend_items(self, user_id, num_recommendations=10):
        """
        Recommend items for a specific user
        """
        if user_id not in self.user_ids:
            return []
        
        # Get user's actual ratings
        user_ratings = self.interaction_matrix.loc[user_id]
        
        # Get user's predictions
        user_predictions = self.predictions_matrix.loc[user_id]
        
        # Create DataFrame
        temp = pd.DataFrame({
            'product_id': self.product_ids,
            'actual_rating': user_ratings.values,
            'predicted_rating': user_predictions.values
        })
        
        # Filter products user hasn't rated
        temp = temp[temp['actual_rating'] == 0]
        
        # Sort by predicted rating
        temp = temp.sort_values('predicted_rating', ascending=False)
        
        # Return top N recommendations
        recommendations = temp.head(num_recommendations)['product_id'].tolist()
        
        return recommendations
    
    def get_similar_users(self, user_id, num_users=5):
        """
        Find similar users based on latent features
        """
        if user_id not in self.user_ids:
            return []
        
        user_index = self.user_ids.index(user_id)
        user_vector = self.U[user_index]
        
        # Calculate cosine similarity
        similarities = np.dot(self.U, user_vector) / (
            np.linalg.norm(self.U, axis=1) * np.linalg.norm(user_vector)
        )
        
        # Get top similar users (excluding the user themselves)
        similar_indices = np.argsort(similarities)[::-1][1:num_users+1]
        similar_user_ids = [self.user_ids[i] for i in similar_indices]
        
        return similar_user_ids