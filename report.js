// Crime Report Form Application

let adminLoggedIn = false
let currentPassword = ''

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  setupFormListener()
  setupAdminToggle()
}

function setupFormListener() {
  const form = document.getElementById("crimeReportForm")
  form.addEventListener("submit", handleFormSubmit)
}

function setupAdminToggle() {
  const adminToggle = document.getElementById("adminToggle")
  const adminClose = document.getElementById("adminClose")
  const adminLoginBtn = document.getElementById("adminLoginBtn")
  const adminLogout = document.getElementById("adminLogout")
  const refreshReports = document.getElementById("refreshReports")
  const exportReports = document.getElementById("exportReports")
  const deleteAllReports = document.getElementById("deleteAllReports")

  adminToggle.addEventListener("click", openAdminPanel)
  adminClose.addEventListener("click", closeAdminPanel)
  adminLoginBtn.addEventListener("click", handleAdminLogin)
  adminLogout.addEventListener("click", handleAdminLogout)
  refreshReports.addEventListener("click", handleRefreshReports)
  exportReports.addEventListener("click", handleExportReports)
  deleteAllReports.addEventListener("click", handleDeleteAllReports)
}

function handleFormSubmit(e) {
  e.preventDefault()

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    location: document.getElementById("location").value,
    crime_type: document.getElementById("crime_type").value,
    date: document.getElementById("date").value,
    description: document.getElementById("description").value,
  }

  // Submit to backend
  fetch("/api/submit-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showSuccessMessage(data.report_id)
        document.getElementById("crimeReportForm").reset()
      } else {
        showToast("Error: " + data.error, "error")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      showToast("Failed to submit report. Please try again.", "error")
    })
}

function showSuccessMessage(reportId) {
  document.getElementById("formSection").style.display = "none"
  document.getElementById("successSection").style.display = "block"
  document.getElementById("reportId").textContent = `Report ID: ${reportId}`
  showToast("Report submitted successfully!", "success")
}

function openAdminPanel() {
  document.getElementById("adminPanel").style.display = "block"
  document.getElementById("adminLogin").style.display = "block"
  document.getElementById("adminReports").style.display = "none"
}

function closeAdminPanel() {
  document.getElementById("adminPanel").style.display = "none"
  adminLoggedIn = false
  currentPassword = ''
}

function handleAdminLogin() {
  const password = document.getElementById("adminPassword").value

  if (!password) {
    showToast("Please enter a password", "error")
    return
  }

  currentPassword = password

  fetch(`/api/reports?password=${encodeURIComponent(password)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast("Incorrect password", "error")
        currentPassword = ''
      } else {
        adminLoggedIn = true
        displayReports(data.reports)
        document.getElementById("adminLogin").style.display = "none"
        document.getElementById("adminReports").style.display = "block"
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      showToast("Failed to load reports", "error")
      currentPassword = ''
    })
}

function handleAdminLogout() {
  adminLoggedIn = false
  currentPassword = ''
  document.getElementById("adminPassword").value = ""
  document.getElementById("adminLogin").style.display = "block"
  document.getElementById("adminReports").style.display = "none"
}

function handleRefreshReports() {
  if (!adminLoggedIn || !currentPassword) {
    showToast("Please login first", "error")
    return
  }

  fetch(`/api/reports?password=${encodeURIComponent(currentPassword)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast("Failed to refresh reports", "error")
      } else {
        displayReports(data.reports)
        showToast("Reports refreshed", "success")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      showToast("Failed to refresh reports", "error")
    })
}

function handleDeleteReport(reportId) {
  if (!confirm(`Are you sure you want to delete Report #${reportId}?`)) {
    return
  }

  fetch(`/api/reports/${reportId}?password=${encodeURIComponent(currentPassword)}`, {
    method: "DELETE"
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("Report deleted successfully", "success")
        handleRefreshReports()
      } else {
        showToast("Error: " + data.error, "error")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      showToast("Failed to delete report", "error")
    })
}

function handleDeleteAllReports() {
  if (!confirm("Are you sure you want to delete ALL reports? This action cannot be undone!")) {
    return
  }

  fetch(`/api/reports/delete-all?password=${encodeURIComponent(currentPassword)}`, {
    method: "DELETE"
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("All reports deleted successfully", "success")
        handleRefreshReports()
      } else {
        showToast("Error: " + data.error, "error")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      showToast("Failed to delete all reports", "error")
    })
}

function handleExportReports() {
  if (!adminLoggedIn || !currentPassword) {
    showToast("Please login first", "error")
    return
  }

  // Create a temporary link and trigger download
  const url = `/api/reports/export?password=${encodeURIComponent(currentPassword)}`
  const link = document.createElement('a')
  link.href = url
  link.download = 'crime_reports.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  showToast("Exporting reports to CSV...", "success")
}

function displayReports(reports) {
  const reportsList = document.getElementById("reportsList")
  const reportCount = document.getElementById("reportCount")

  reportCount.textContent = `Total Reports: ${reports.length}`

  if (reports.length === 0) {
    reportsList.innerHTML = '<p class="no-reports">No reports submitted yet.</p>'
    return
  }

  reportsList.innerHTML = reports
    .map(
      (report) => `
        <div class="report-item">
            <div class="report-header">
                <h3>Report #${report.id} - ${report.crime_type}</h3>
                <span class="report-status ${report.status}">${report.status}</span>
            </div>
            <div class="report-details">
                <p><strong>Name:</strong> ${escapeHtml(report.name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(report.email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(report.phone)}</p>
                <p><strong>Location:</strong> ${escapeHtml(report.location)}</p>
                <p><strong>Date:</strong> ${report.date}</p>
                <p><strong>Description:</strong></p>
                <p class="report-description">${escapeHtml(report.description)}</p>
                <p class="report-submitted">Submitted: ${new Date(report.timestamp).toLocaleString()}</p>
            </div>
            <div class="report-actions">
                <button class="btn-delete" onclick="handleDeleteReport(${report.id})">Delete Report</button>
            </div>
        </div>
    `,
    )
    .join("")
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = `toast show ${type}`

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}