from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
import json
from datetime import datetime
from pathlib import Path
app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app, resources={r"/*": {"origins": "*"}})

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHARTS_FOLDER = os.path.join(BASE_DIR, 'charts')
ALT_CHARTS_FOLDER = os.path.join(BASE_DIR, 'graph')
STATIC_FOLDER = os.path.join(BASE_DIR, 'static', 'charts')
REPORTS_FILE = os.path.join(BASE_DIR, 'crime_reports.json')

# Find which folder exists
def get_charts_folder():
    if os.path.exists(CHARTS_FOLDER):
        return CHARTS_FOLDER
    elif os.path.exists(ALT_CHARTS_FOLDER):
        return ALT_CHARTS_FOLDER
    elif os.path.exists(STATIC_FOLDER):
        return STATIC_FOLDER
    else:
        return CHARTS_FOLDER

ACTIVE_CHARTS_FOLDER = get_charts_folder()

# Helper functions for report management
def load_reports():
    """Load reports from JSON file"""
    if os.path.exists(REPORTS_FILE):
        with open(REPORTS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_reports(reports):
    """Save reports to JSON file"""
    with open(REPORTS_FILE, 'w') as f:
        json.dump(reports, f, indent=2)

print("=" * 60)
print(f"BASE_DIR: {BASE_DIR}")
print(f"CHARTS_FOLDER: {ACTIVE_CHARTS_FOLDER}")
print(f"Charts folder exists: {os.path.exists(ACTIVE_CHARTS_FOLDER)}")
if os.path.exists(ACTIVE_CHARTS_FOLDER):
    charts = [f for f in os.listdir(ACTIVE_CHARTS_FOLDER) if f.endswith('.png')]
    print(f"Found {len(charts)} chart files: {charts}")
print("=" * 60)

@app.route('/')
def index():
    """Serve the main HTML file"""
    try:
        return send_from_directory(BASE_DIR, 'index.html')
    except:
        return jsonify({'error': 'index.html not found'}), 404

@app.route('/report')
def report_page():
    """Serve the crime report page"""
    try:
        return send_from_directory(BASE_DIR, 'report.html')
    except:
        return jsonify({'error': 'report.html not found'}), 404

@app.route('/api/health')
def health_check():
    """Health check endpoint with detailed info"""
    charts = []
    if os.path.exists(ACTIVE_CHARTS_FOLDER):
        charts = [f for f in os.listdir(ACTIVE_CHARTS_FOLDER) if f.endswith('.png')]
    
    return jsonify({
        'status': 'healthy',
        'charts_folder': ACTIVE_CHARTS_FOLDER,
        'available_charts': charts,
        'folder_exists': os.path.exists(ACTIVE_CHARTS_FOLDER)
    })

@app.route('/api/charts/<chart_name>')
def get_chart(chart_name):
    """Serve chart image from charts folder with proper MIME type"""
    try:
        if not chart_name.endswith('.png'):
            chart_name = f"{chart_name}.png"
        
        chart_path = os.path.join(ACTIVE_CHARTS_FOLDER, chart_name)
        print(f"[CHART REQUEST] Requesting: {chart_name}")
        print(f"[CHART REQUEST] Full path: {chart_path}")
        print(f"[CHART REQUEST] File exists: {os.path.exists(chart_path)}")
        
        if not os.path.exists(chart_path):
            available_charts = []
            if os.path.exists(ACTIVE_CHARTS_FOLDER):
                available_charts = sorted([f for f in os.listdir(ACTIVE_CHARTS_FOLDER) if f.endswith('.png')])
            
            error_msg = f"Chart not found: {chart_name}. Available charts: {', '.join(available_charts)}"
            print(f"[ERROR] {error_msg}")
            
            return jsonify({
                'error': error_msg,
                'requested': chart_name,
                'available_charts': available_charts,
                'folder': ACTIVE_CHARTS_FOLDER,
                'folder_exists': os.path.exists(ACTIVE_CHARTS_FOLDER)
            }), 404
        
        print(f"[SUCCESS] Serving chart: {chart_name}")
        return send_from_directory(
            ACTIVE_CHARTS_FOLDER, 
            chart_name,
            mimetype='image/png'
        )
    
    except Exception as e:
        print(f"[ERROR] Exception serving chart: {str(e)}")
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500

@app.route('/api/submit-report', methods=['POST'])
def submit_report():
    """Handle crime report submission"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'location', 'crime_type', 'description', 'date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create report object
        report = {
            'id': len(load_reports()) + 1,
            'timestamp': datetime.now().isoformat(),
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'location': data['location'],
            'crime_type': data['crime_type'],
            'description': data['description'],
            'date': data['date'],
            'status': 'pending'
        }
        
        # Save report
        reports = load_reports()
        reports.append(report)
        save_reports(reports)
        
        print(f"[REPORT] New report submitted: ID {report['id']}")
        
        return jsonify({
            'success': True,
            'message': 'Report submitted successfully',
            'report_id': report['id']
        }), 201
    
    except Exception as e:
        print(f"[ERROR] Failed to submit report: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Retrieve all reports (admin only)"""
    try:
        # Get password from query params
        password = request.args.get('password', '')
        
        # Simple password check (change this to something more secure)
        if password != 'admin123':
            return jsonify({'error': 'Unauthorized'}), 401
        
        reports = load_reports()
        return jsonify({'reports': reports, 'count': len(reports)}), 200
    
    except Exception as e:
        print(f"[ERROR] Failed to retrieve reports: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files like styles.css, app.js, report.js, report.css, etc."""
    if filename.endswith(('.css', '.js', '.html')):
        try:
            return send_from_directory(BASE_DIR, filename)
        except:
            return jsonify({'error': f'File not found: {filename}'}), 404
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/reports/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    """Delete a specific report (admin only)"""
    try:
        # Get password from query params
        password = request.args.get('password', '')
        
        if password != 'admin123':
            return jsonify({'error': 'Unauthorized'}), 401
        
        reports = load_reports()
        
        # Find and remove the report
        original_length = len(reports)
        reports = [r for r in reports if r['id'] != report_id]
        
        if len(reports) == original_length:
            return jsonify({'error': 'Report not found'}), 404
        
        save_reports(reports)
        
        print(f"[REPORT] Deleted report: ID {report_id}")
        
        return jsonify({
            'success': True,
            'message': 'Report deleted successfully'
        }), 200
    
    except Exception as e:
        print(f"[ERROR] Failed to delete report: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/delete-all', methods=['DELETE'])
def delete_all_reports():
    """Delete all reports (admin only)"""
    try:
        # Get password from query params
        password = request.args.get('password', '')
        
        if password != 'admin123':
            return jsonify({'error': 'Unauthorized'}), 401
        
        save_reports([])
        
        print(f"[REPORT] Deleted all reports")
        
        return jsonify({
            'success': True,
            'message': 'All reports deleted successfully'
        }), 200
    
    except Exception as e:
        print(f"[ERROR] Failed to delete all reports: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/export', methods=['GET'])
def export_reports():
    """Export reports to CSV (admin only)"""
    try:
        import csv
        from io import StringIO
        
        # Get password from query params
        password = request.args.get('password', '')
        
        if password != 'admin123':
            return jsonify({'error': 'Unauthorized'}), 401
        
        reports = load_reports()
        
        if len(reports) == 0:
            return jsonify({'error': 'No reports to export'}), 404
        
        # Create CSV in memory
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=['id', 'timestamp', 'name', 'email', 'phone', 'location', 'crime_type', 'description', 'date', 'status'])
        writer.writeheader()
        
        for report in reports:
            writer.writerow(report)
        
        # Get CSV content
        csv_content = output.getvalue()
        output.close()
        
        print(f"[REPORT] Exported {len(reports)} reports to CSV")
        
        # Return as downloadable file
        from flask import make_response
        response = make_response(csv_content)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = 'attachment; filename=crime_reports.csv'
        
        return response
    
    except Exception as e:
        print(f"[ERROR] Failed to export reports: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create charts folder if it doesn't exist
    if not os.path.exists(ACTIVE_CHARTS_FOLDER):
        print(f"\n⚠️  WARNING: Charts folder does not exist!")
        print(f"Creating folder at: {ACTIVE_CHARTS_FOLDER}\n")
        os.makedirs(ACTIVE_CHARTS_FOLDER, exist_ok=True)
    else:
        # List available charts
        chart_files = [f for f in os.listdir(ACTIVE_CHARTS_FOLDER) if f.endswith('.png')]
        print(f"\n✅ Found {len(chart_files)} chart files:")
        for chart in sorted(chart_files):
            print(f"   - {chart}")
        print()
    
    print("🚀 Flask server starting...")
    print("📍 Server URL: http://localhost:5000")
    print("🔍 Test health: http://localhost:5000/api/health")
    print("📊 Test chart endpoint: http://localhost:5000/api/charts/state.png")
    print("📝 Crime Report Page: http://localhost:5000/report")
    print("\nPress CTRL+C to stop the server\n")
    
    app.run(debug=True, port=5000, host='0.0.0.0')

