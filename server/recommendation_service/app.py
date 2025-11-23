from flask import Flask, jsonify, request
from flask_cors import CORS
from data_processor import DataProcessor
from svd_recommender import SVDRecommender
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Global variables for model caching
recommender = None
last_trained = None
RETRAIN_INTERVAL = timedelta(hours=24)  # Retrain every 24 hours

def train_model():
    """Train or retrain the recommendation model"""
    global recommender, last_trained
    
    print("="*50)
    print("Training recommendation model...")
    print("="*50)
    
    processor = DataProcessor()
    
    try:
        # Get data (users with at least 10 ratings)
        df = processor.get_ratings_data(min_ratings=10)
        
        if df is None or len(df) == 0:
            print("[ERROR] No sufficient data for training")
            return False
        
        # Create interaction matrix
        interaction_matrix, sparse_matrix = processor.create_interaction_matrix(df)
        
        # Train model
        recommender = SVDRecommender(k=50)
        recommender.fit(interaction_matrix, sparse_matrix)
        
        last_trained = datetime.now()
        print(f"[SUCCESS] Model trained successfully at {last_trained}")
        print("="*50)
        return True
        
    except Exception as e:
        print(f"[ERROR] Error training model: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        processor.close()

def check_and_retrain():
    """Check if model needs retraining"""
    global last_trained
    
    if recommender is None or last_trained is None:
        return train_model()
    
    if datetime.now() - last_trained > RETRAIN_INTERVAL:
        return train_model()
    
    return True

@app.route('/api/recommendations/<int:user_id>', methods=['GET'])
def get_recommendations(user_id):
    """Get recommendations for a user"""
    try:
        # Check if model needs retraining
        if not check_and_retrain():
            return jsonify({
                'error': 'Recommendation model not available',
                'recommendations': []
            }), 503
        
        # Get number of recommendations from query params
        num_recs = request.args.get('limit', default=10, type=int)
        
        # Get recommendations
        product_ids = recommender.recommend_items(user_id, num_recommendations=num_recs)
        
        if not product_ids:
            return jsonify({
                'user_id': user_id,
                'recommendations': [],
                'message': 'No recommendations available for this user'
            })
        
        # Get product details
        processor = DataProcessor()
        try:
            products = processor.get_product_details(product_ids)
            
            # Maintain order of recommendations
            products_dict = {p['id']: p for p in products}
            ordered_products = [products_dict[pid] for pid in product_ids if pid in products_dict]
            
            return jsonify({
                'user_id': user_id,
                'recommendations': ordered_products,
                'count': len(ordered_products)
            })
        finally:
            processor.close()
        
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/similar-users/<int:user_id>', methods=['GET'])
def get_similar_users(user_id):
    """Get similar users"""
    try:
        if not check_and_retrain():
            return jsonify({'error': 'Model not trained'}), 500
        
        num_users = request.args.get('limit', default=5, type=int)
        similar_user_ids = recommender.get_similar_users(user_id, num_users=num_users)
        
        return jsonify({
            'user_id': user_id,
            'similar_users': similar_user_ids
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    """Manually trigger model retraining"""
    try:
        success = train_model()
        if success:
            return jsonify({'message': 'Model retrained successfully'})
        else:
            return jsonify({'error': 'Failed to retrain model'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_trained': recommender is not None,
        'last_trained': last_trained.isoformat() if last_trained else None
    })

if __name__ == '__main__':
    # Train model on startup
    train_model()
    
    # Run Flask app
    port = int(os.getenv('RECOMMENDATION_PORT', 5001))
    print(f"\n[START] Recommendation service starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)