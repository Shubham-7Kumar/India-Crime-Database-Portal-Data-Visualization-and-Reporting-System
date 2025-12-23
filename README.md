# India Crime Database Portal: Interactive Data Visualization and Reporting System

## 📌 Project Overview
The **India Crime Database Portal** is a full-stack web application designed to transform complex, high-dimensional crime statistics into actionable visual intelligence. Built with a **Python Flask** backend and a dynamic **JavaScript** frontend, the portal provides a dual-interface for the public to explore crime patterns and for administrators to manage incident records securely.

## 🛠️ Technical Stack
* **Backend:** Python 3.x with Flask Framework for RESTful API routing and server-side logic.
* **Frontend:** Vanilla JavaScript (ES6+), HTML5, and CSS3 using custom properties for responsive design.
* **Data Storage:** Structured JSON for persistent crime reports and a directory-based storage system for analytical PNG assets.
* **Security:** Flask-CORS for Cross-Origin Resource Sharing and session-based administrative authentication.

## 🚀 Key Features

### 1. Advanced Data Visualization Suite
The portal features an analytical engine capable of rendering **8 distinct types of visualizations** to uncover geographic and temporal crime patterns:
* **Geographic Analysis:** India Choropleth Maps and District Crime Heatmaps.
* **Temporal Trends:** Year-wise Line Charts and Time Series comparisons.
* **Categorical Distribution:** Pie Charts, Stacked Bar Charts, and Crime-vs-Population Scatter plots.

### 2. Secure Anonymous Reporting Pipeline
A specialized module that allows users to submit crime reports directly to the system:
* **Client-Side Validation:** Ensures data integrity before transmission to the API.
* **Automated Metadata:** The backend automatically generates unique IDs and ISO-standard timestamps for every entry.

### 3. Administrative Control Panel
A protected dashboard for data governance and auditing:
* **CRUD Operations:** Administrators can view the complete incident database and perform selective deletions.
* **Data Export:** Integrated functionality to convert the JSON database into a **CSV format** for external research and documentation.

## ⚙️ System Architecture
The project follows a **Client-Server Architecture** where the frontend acts as a thin client, fetching analytical data and submitting reports through a series of defined API endpoints.

## 🛠️ Installation & Setup
1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/your-username/india-crime-portal.git](https://github.com/your-username/india-crime-portal.git)
   cd india-crime-portal

2. **Install Dependencies:**
    pip install -r requirements.txt

3. **Run the Server:**
    python app.py

4. **Access the Portal:**
    Open index.html in your browser or navigate to http://localhost:5000

**API Endpoints**
    GET /api/get-reports: Fetches all stored crime reports (Admin only).

    POST /api/submit-report: Submits a new crime incident to the JSON database.

    GET /api/export-csv: Generates and downloads a CSV file of all reports.

    DELETE /api/delete-report/<id>: Removes a specific incident from the database.