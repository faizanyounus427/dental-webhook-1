let appointments = [];
let statusChart, sentimentChart;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
    setInterval(loadAppointments, 5000);
});

// Load appointments (SIMPLE API)
async function loadAppointments() {
    try {
        const res = await fetch('/api/appointments');
        appointments = await res.json();

        updateTable();
        updateStats();
        updateCharts();
    } catch (err) {
        console.error("Error:", err);
    }
}

// Update table
function updateTable() {
    const tbody = document.getElementById('appointmentsList');
    tbody.innerHTML = '';

    if (appointments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">No data</td></tr>`;
        return;
    }

    appointments.forEach(a => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${a.patientName}</td>
            <td>${a.phoneNumber}</td>
            <td>${a.reasonForVisit}</td>
            <td>${a.appointmentDate || '-'} ${a.appointmentTime || ''}</td>
            <td>${a.status}</td>
            <td>${a.sentiment}</td>
            <td>-</td>
            <td>-</td>
        `;
        tbody.appendChild(row);
    });
}

// Update stats
function updateStats() {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;

    document.getElementById('totalStats').textContent = total;
    document.getElementById('completedStats').textContent = completed;
    document.getElementById('scheduledStats').textContent = scheduled;
    document.getElementById('cancelledStats').textContent = cancelled;
}

// Charts
function updateCharts() {
    const statusCounts = {
        scheduled: 0,
        completed: 0,
        cancelled: 0
    };

    appointments.forEach(a => {
        if (statusCounts[a.status] !== undefined) {
            statusCounts[a.status]++;
        }
    });

    const ctx1 = document.getElementById('statusChart').getContext('2d');
    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Scheduled', 'Completed', 'Cancelled'],
            datasets: [{
                data: [
                    statusCounts.scheduled,
                    statusCounts.completed,
                    statusCounts.cancelled
                ]
            }]
        }
    });

    const ctx2 = document.getElementById('sentimentChart').getContext('2d');
    if (sentimentChart) sentimentChart.destroy();

    sentimentChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [2, 3, 1] // temporary
            }]
        }
    });
}