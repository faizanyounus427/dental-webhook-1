let currentClinic = '';
let currentAppointmentId = null;
let statusChart, sentimentChart;

const modal = document.getElementById('appointmentModal');
const closeBtn = document.querySelector('.close');

closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === modal) modal.style.display = 'none';
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadClinics();
    loadAppointments();
    loadStatistics();
});

document.getElementById('clinicSelect').addEventListener('change', (e) => {
    currentClinic = e.target.value;
    if (currentClinic) {
        loadAppointments();
        loadStatistics();
    }
});

// Load clinics for dropdown
async function loadClinics() {
    try {
        const response = await fetch('/api/clinics');
        const clinics = await response.json();
        const select = document.getElementById('clinicSelect');
        select.innerHTML = '<option value="">Select a clinic...</option>';
        clinics.forEach(clinic => {
            const option = document.createElement('option');
            option.value = clinic.clinicName;
            option.textContent = clinic.clinicName;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error loading clinics:', err);
    }
}

// Load appointments
async function loadAppointments() {
    if (!currentClinic) return;

    try {
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        let url = `/api/appointments/clinic/${currentClinic}`;
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (dateFilter) params.append('startDate', dateFilter);

        const response = await fetch(`${url}?${params}`);
        const { data: appointments } = await response.json();

        const tbody = document.getElementById('appointmentsList');
        tbody.innerHTML = '';

        if (appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No appointments found</td></tr>';
            return;
        }

        appointments.forEach(apt => {
            const row = document.createElement('tr');
            const date = new Date(apt.appointmentDate);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            row.innerHTML = `
                <td>${apt.patientName}</td>
                <td>${apt.phoneNumber}</td>
                <td>${apt.reasonForVisit}</td>
                <td>${formattedDate} @ ${apt.appointmentTime}</td>
                <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
                <td><span class="sentiment-badge ${apt.sentiment}">${apt.sentiment}</span></td>
                <td>${apt.callDuration} min</td>
                <td><button class="action-btn" onclick="viewDetails('${apt._id}')">View</button></td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Error loading appointments:', err);
    }
}

// Load statistics
async function loadStatistics() {
    if (!currentClinic) return;

    try {
        const response = await fetch(`/api/appointments/stats/${currentClinic}`);
        const stats = await response.json();

        // Update stat cards
        document.getElementById('totalStats').textContent = stats.total;
        document.getElementById('completedStats').textContent = stats.completed;
        document.getElementById('scheduledStats').textContent = stats.scheduled;
        document.getElementById('cancelledStats').textContent = stats.cancelled;

        // Update status chart
        updateStatusChart(stats);

        // Update sentiment chart
        updateSentimentChart(stats.sentiment);
    } catch (err) {
        console.error('Error loading statistics:', err);
    }
}

// Update status chart
function updateStatusChart(stats) {
    const ctx = document.getElementById('statusChart').getContext('2d');

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
            datasets: [{
                data: [
                    stats.scheduled,
                    stats.completed,
                    stats.cancelled,
                    stats.noShow
                ],
                backgroundColor: [
                    '#fbbf24',
                    '#34d399',
                    '#f87171',
                    '#a78bfa'
                ],
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 13 }
                    }
                }
            }
        }
    });
}

// Update sentiment chart
function updateSentimentChart(sentiment) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');

    if (sentimentChart) sentimentChart.destroy();

    sentimentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                label: 'Sentiment Count',
                data: [
                    sentiment.positive,
                    sentiment.neutral,
                    sentiment.negative
                ],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// View appointment details
async function viewDetails(appointmentId) {
    try {
        const response = await fetch(`/api/appointments/${appointmentId}`);
        const apt = await response.json();

        currentAppointmentId = appointmentId;

        const modalBody = document.getElementById('modalBody');
        const date = new Date(apt.appointmentDate);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        modalBody.innerHTML = `
            <div><strong>Patient Name:</strong> ${apt.patientName}</div>
            <div><strong>Phone:</strong> <a href="tel:${apt.phoneNumber}">${apt.phoneNumber}</a></div>
            <div><strong>Reason for Visit:</strong> ${apt.reasonForVisit}</div>
            <div><strong>Appointment Date:</strong> ${formattedDate}</div>
            <div><strong>Appointment Time:</strong> ${apt.appointmentTime}</div>
            <div><strong>Call Duration:</strong> ${apt.callDuration} minutes</div>
            <div><strong>Sentiment:</strong> <span class="sentiment-badge ${apt.sentiment}">${apt.sentiment}</span></div>
            ${apt.transcription ? `<div><strong>Transcription:</strong> <br/>${apt.transcription}</div>` : ''}
            ${apt.notes ? `<div><strong>Notes:</strong> <br/>${apt.notes}</div>` : ''}
        `;

        document.getElementById('statusSelect').value = apt.status;
        document.getElementById('notesInput').value = apt.notes || '';

        modal.style.display = 'block';
    } catch (err) {
        console.error('Error loading appointment details:', err);
        alert('Error loading appointment details');
    }
}

// Save appointment update
async function saveAppointmentUpdate() {
    try {
        const status = document.getElementById('statusSelect').value;
        const notes = document.getElementById('notesInput').value;

        const response = await fetch(`/api/appointments/${currentAppointmentId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, notes })
        });

        if (response.ok) {
            modal.style.display = 'none';
            loadAppointments();
            loadStatistics();
            alert('Appointment updated successfully!');
        }
    } catch (err) {
        console.error('Error updating appointment:', err);
        alert('Error updating appointment');
    }
}

// Apply filters
function applyFilters() {
    loadAppointments();
}