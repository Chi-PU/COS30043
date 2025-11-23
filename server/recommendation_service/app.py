

# ============================================================================
# app.py - Updated version with automatic retraining on 10th rating
# ============================================================================

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
RETRAIN_INTERVAL = timedelta(hours=24)
MIN_RATINGS_FOR_TRAINING = 10

def train_model():
    """Train or retrain the recommendation model"""
    global recommender, last_trained
    
    print("="*50)
    print("Training recommendation model...")
    print("="*50)
    
    processor = DataProcessor()
    
    try:
        # Get data (users with at least 10 ratings)
        df = processor.get_ratings_data(min_ratings=MIN_RATINGS_FOR_TRAINING)
        
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

@app.route('/api/check-and-retrain/<int:user_id>', methods=['POST'])
def trigger_retrain_if_user_ready(user_id):
    """
    Checks if a specific user has MIN_RATINGS_FOR_TRAINING or more reviews
    and triggers model retraining if the condition is met.
    """
    processor = DataProcessor()
    try:
        # 1. Get the current count of ratings for the user
        user_rating_count = processor.get_user_rating_count(user_id)
        
        print(f"=" * 60)
        print(f"[CHECK-RETRAIN] User {user_id} has {user_rating_count} ratings")
        print(f"[CHECK-RETRAIN] Minimum required: {MIN_RATINGS_FOR_TRAINING}")
        print(f"=" * 60)

        if user_rating_count >= MIN_RATINGS_FOR_TRAINING:
            print(f"[CHECK-RETRAIN] ✓ User meets threshold, triggering retrain...")
            
            # 2. Trigger retraining
            success = train_model()
            
            if success:
                print(f"[CHECK-RETRAIN] ✓ Retraining completed successfully")
                
                # 3. Verify user is in the model
                if recommender and user_id in recommender.user_ids:
                    print(f"[CHECK-RETRAIN] ✓ User {user_id} is now in the model")
                else:
                    print(f"[CHECK-RETRAIN] ⚠ WARNING: User {user_id} NOT in model after training")
                
                return jsonify({
                    'user_id': user_id,
                    'status': 'Retraining triggered',
                    'message': f'User {user_id} now meets the minimum rating threshold ({MIN_RATINGS_FOR_TRAINING}). Model successfully retrained.',
                    'rating_count': user_rating_count,
                    'user_in_model': user_id in recommender.user_ids if recommender else False
                }), 200
            else:
                print(f"[CHECK-RETRAIN] ✗ Retraining failed")
                return jsonify({
                    'user_id': user_id,
                    'status': 'Retraining failed',
                    'message': 'Condition met, but retraining failed due to data or system error.',
                    'rating_count': user_rating_count
                }), 500
        else:
            print(f"[CHECK-RETRAIN] ✗ User does not meet threshold")
            remaining = MIN_RATINGS_FOR_TRAINING - user_rating_count
            return jsonify({
                'user_id': user_id,
                'status': 'No action taken',
                'message': f'User {user_id} has {user_rating_count} ratings. Need {remaining} more to reach minimum ({MIN_RATINGS_FOR_TRAINING}).',
                'rating_count': user_rating_count,
                'ratings_needed': remaining
            }), 200
        
    except AttributeError as ae:
        error_msg = f"DataProcessor error: {ae}. Ensure 'get_user_rating_count(user_id)' is implemented."
        print(f"[ERROR] {error_msg}")
        return jsonify({'error': error_msg}), 500

    except Exception as e:
        print(f"[ERROR] Error in trigger_retrain_if_user_ready: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        processor.close()


# Updated recommendations endpoint with better error handling
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
        
        # Check if user is in the model
        if user_id not in recommender.user_ids:
            print(f"[WARNING] User {user_id} not in model. Available users: {len(recommender.user_ids)}")
            return jsonify({
                'user_id': user_id,
                'recommendations': [],
                'message': f'User not found in recommendation model. Please ensure you have at least {MIN_RATINGS_FOR_TRAINING} ratings and try retraining the model.',
                'user_in_model': False
            }), 404
        
        # Get number of recommendations from query params
        num_recs = request.args.get('limit', default=10, type=int)
        
        # Get recommendations
        product_ids = recommender.recommend_items(user_id, num_recommendations=num_recs)
        
        if not product_ids:
            return jsonify({
                'user_id': user_id,
                'recommendations': [],
                'message': 'No recommendations available for this user',
                'user_in_model': True
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
                'count': len(ordered_products),
                'user_in_model': True
            })
        finally:
            processor.close()
        
    except Exception as e:
        print(f"[ERROR] Error in get_recommendations: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/user-stats/<int:user_id>', methods=['GET'])
def get_user_stats(user_id):
    """Get user rating statistics"""
    try:
        processor = DataProcessor()
        try:
            rating_count = processor.get_user_rating_count(user_id)
            
            return jsonify({
                'user_id': user_id,
                'rating_count': rating_count,
                'eligible_for_recommendations': rating_count >= MIN_RATINGS_FOR_TRAINING,
                'ratings_needed': max(0, MIN_RATINGS_FOR_TRAINING - rating_count)
            })
        finally:
            processor.close()
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


@app.route('/api/debug/<int:user_id>', methods=['GET'])
def debug_recommendations(user_id):
    """
    Debug endpoint to check recommendation system status
    """
    processor = DataProcessor()
    try:
        # 1. Check user's rating count
        rating_count = processor.get_user_rating_count(user_id)
        
        # 2. Check if user is in the training data
        df = processor.get_ratings_data(min_ratings=MIN_RATINGS_FOR_TRAINING)
        user_in_training = user_id in df['user_id'].unique() if df is not None else False
        
        # 3. Check if model is trained
        model_trained = recommender is not None
        
        # 4. Check if user is in the model
        user_in_model = False
        if model_trained and recommender.user_ids:
            user_in_model = user_id in recommender.user_ids
        
        # 5. Get sample ratings for this user
        sample_ratings = processor.conn.cursor()
        sample_ratings.execute(
            "SELECT product_id, rating FROM reviews WHERE user_id = %s LIMIT 5",
            (user_id,)
        )
        ratings_sample = sample_ratings.fetchall()
        
        debug_info = {
            'user_id': user_id,
            'rating_count': rating_count,
            'min_required': MIN_RATINGS_FOR_TRAINING,
            'eligible_for_training': rating_count >= MIN_RATINGS_FOR_TRAINING,
            'user_in_training_data': user_in_training,
            'model_trained': model_trained,
            'user_in_model': user_in_model,
            'last_trained': last_trained.isoformat() if last_trained else None,
            'sample_ratings': [{'product_id': r[0], 'rating': r[1]} for r in ratings_sample],
            'total_users_in_model': len(recommender.user_ids) if model_trained else 0,
            'total_products_in_model': len(recommender.product_ids) if model_trained else 0
        }
        
        return jsonify(debug_info)
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500
    finally:
        processor.close()

        
if __name__ == '__main__':
    # Train model on startup
    train_model()
    
    # Run Flask app
    port = int(os.getenv('RECOMMENDATION_PORT', 5001))
    print(f"\n[START] Recommendation service starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)