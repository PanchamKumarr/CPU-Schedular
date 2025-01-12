document.getElementById('process-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form input values
    const numProcesses = parseInt(document.getElementById('num-processes').value);
    const burstTime = document.getElementById('burst-time').value.split(',').map(Number);
    const arrivalTime = document.getElementById('arrival-time').value.split(',').map(Number);
    const priority = document.getElementById('priority').value ? 
                      document.getElementById('priority').value.split(',').map(Number) : [];
    const quantum = document.getElementById('quantum').value ? parseInt(document.getElementById('quantum').value) : 0;
    const algorithm = document.getElementById('algorithm').value;

    // Validation
    if (burstTime.length !== numProcesses || arrivalTime.length !== numProcesses) {
        alert("The number of burst times and arrival times should match the number of processes.");
        return;
    }

    // Clear previous output
    document.getElementById('output').innerHTML = '';
    document.getElementById('explanation').innerHTML = '';

    switch(algorithm) {
        case 'fcfs':
            fcfs(burstTime, arrivalTime);
            break;
        case 'sjf':
            sjf(burstTime, arrivalTime);
            break;
        case 'rr':
            roundRobin(burstTime, arrivalTime, quantum);
            break;
        case 'priority':
            priorityScheduling(burstTime, arrivalTime, priority);
            break;
        case 'srtf':
            srtf(burstTime, arrivalTime);
            break;
        case 'mlq':
            multipleLevelQueues(burstTime, arrivalTime, priority);
            break;
    }
});

function fcfs(burstTime, arrivalTime) {
    let n = burstTime.length;
    let waitingTime = [];
    let turnAroundTime = [];
    let totalWaitingTime = 0;
    let totalTurnAroundTime = 0;
    let output = "<h3>First Come First Serve (FCFS)</h3><p>Process execution order: </p><ul>";

    for (let i = 0; i < n; i++) {
        if (i === 0) {
            waitingTime[i] = 0;
        } else {
            waitingTime[i] = burstTime[i - 1] + waitingTime[i - 1] - arrivalTime[i];
        }
        turnAroundTime[i] = burstTime[i] + waitingTime[i];
        totalWaitingTime += waitingTime[i];
        totalTurnAroundTime += turnAroundTime[i];
        output += `<li>Process ${i + 1}: Waiting Time = ${waitingTime[i]}, Turnaround Time = ${turnAroundTime[i]}</li>`;
    }

    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnAroundTime = totalTurnAroundTime / n;

    output += `</ul><p>Average Waiting Time: ${avgWaitingTime.toFixed(2)}</p><p>Average Turnaround Time: ${avgTurnAroundTime.toFixed(2)}</p>`;

    document.getElementById('output').innerHTML = output;
    document.getElementById('explanation').innerHTML = generateExplanation('FCFS');
}

function sjf(burstTime, arrivalTime) {
    // Shortest Job First (SJF) logic (non-preemptive)
    let n = burstTime.length;
    let waitingTime = [];
    let turnAroundTime = [];
    let totalWaitingTime = 0;
    let totalTurnAroundTime = 0;
    let output = "<h3>Shortest Job First (SJF)</h3><p>Process execution order: </p><ul>";

    // Sort processes by burst time
    let processes = Array.from({length: n}, (v, i) => ({index: i, burstTime: burstTime[i], arrivalTime: arrivalTime[i]}));
    processes.sort((a, b) => a.burstTime - b.burstTime);

    for (let i = 0; i < n; i++) {
        let current = processes[i];
        if (i === 0) {
            waitingTime[current.index] = 0;
        } else {
            waitingTime[current.index] = burstTime[processes[i - 1].index] + waitingTime[processes[i - 1].index] - current.arrivalTime;
        }
        turnAroundTime[current.index] = current.burstTime + waitingTime[current.index];
        totalWaitingTime += waitingTime[current.index];
        totalTurnAroundTime += turnAroundTime[current.index];
        output += `<li>Process ${current.index + 1}: Waiting Time = ${waitingTime[current.index]}, Turnaround Time = ${turnAroundTime[current.index]}</li>`;
    }

    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnAroundTime = totalTurnAroundTime / n;

    output += `</ul><p>Average Waiting Time: ${avgWaitingTime.toFixed(2)}</p><p>Average Turnaround Time: ${avgTurnAroundTime.toFixed(2)}</p>`;

    document.getElementById('output').innerHTML = output;
    document.getElementById('explanation').innerHTML = generateExplanation('SJF');
}

function roundRobin(burstTime, arrivalTime, quantum) {
    // Round Robin logic
    let n = burstTime.length;
    let waitingTime = [];
    let turnAroundTime = [];
    let totalWaitingTime = 0;
    let totalTurnAroundTime = 0;
    let output = "<h3>Round Robin (RR)</h3><p>Process execution order: </p><ul>";

    let remainingBurst = [...burstTime];
    let queue = [];
    let time = 0;
    let index = 0;
    let finished = 0;

    while (finished < n) {
        if (remainingBurst[index] > 0) {
            let currentTime = Math.min(quantum, remainingBurst[index]);
            remainingBurst[index] -= currentTime;
            time += currentTime;
            if (remainingBurst[index] === 0) {
                finished++;
                turnAroundTime[index] = time - arrivalTime[index];
                waitingTime[index] = turnAroundTime[index] - burstTime[index];
                totalWaitingTime += waitingTime[index];
                totalTurnAroundTime += turnAroundTime[index];
                output += `<li>Process ${index + 1}: Waiting Time = ${waitingTime[index]}, Turnaround Time = ${turnAroundTime[index]}</li>`;
            }
        }
        index = (index + 1) % n;
    }

    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnAroundTime = totalTurnAroundTime / n;

    output += `</ul><p>Average Waiting Time: ${avgWaitingTime.toFixed(2)}</p><p>Average Turnaround Time: ${avgTurnAroundTime.toFixed(2)}</p>`;

    document.getElementById('output').innerHTML = output;
    document.getElementById('explanation').innerHTML = generateExplanation('RR');
}

function priorityScheduling(burstTime, arrivalTime, priority) {
    // Priority Based Scheduling logic
    let n = burstTime.length;
    let waitingTime = [];
    let turnAroundTime = [];
    let totalWaitingTime = 0;
    let totalTurnAroundTime = 0;
    let output = "<h3>Priority Based Scheduling</h3><p>Process execution order: </p><ul>";

    let processes = Array.from({length: n}, (v, i) => ({index: i, burstTime: burstTime[i], arrivalTime: arrivalTime[i], priority: priority[i]}));
    processes.sort((a, b) => a.priority - b.priority);

    for (let i = 0; i < n; i++) {
        let current = processes[i];
        if (i === 0) {
            waitingTime[current.index] = 0;
        } else {
            waitingTime[current.index] = burstTime[processes[i - 1].index] + waitingTime[processes[i - 1].index] - current.arrivalTime;
        }
        turnAroundTime[current.index] = current.burstTime + waitingTime[current.index];
        totalWaitingTime += waitingTime[current.index];
        totalTurnAroundTime += turnAroundTime[current.index];
        output += `<li>Process ${current.index + 1}: Waiting Time = ${waitingTime[current.index]}, Turnaround Time = ${turnAroundTime[current.index]}</li>`;
    }

    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnAroundTime = totalTurnAroundTime / n;

    output += `</ul><p>Average Waiting Time: ${avgWaitingTime.toFixed(2)}</p><p>Average Turnaround Time: ${avgTurnAroundTime.toFixed(2)}</p>`;

    document.getElementById('output').innerHTML = output;
    document.getElementById('explanation').innerHTML = generateExplanation('Priority');
}

function srtf(burstTime, arrivalTime) {
    // Shortest Remaining Time First logic
    let n = burstTime.length;
    let waitingTime = [];
    let turnAroundTime = [];
    let totalWaitingTime = 0;
    let totalTurnAroundTime = 0;
    let output = "<h3>Shortest Remaining Time First (SRTF)</h3><p>Process execution order: </p><ul>";

    let remainingBurst = [...burstTime];
    let time = 0;
    let finished = 0;

    while (finished < n) {
        let minTime = Math.min(...remainingBurst.filter(t => t > 0));
        let index = remainingBurst.indexOf(minTime);

        remainingBurst[index] = 0; // process finished
        finished++;
        turnAroundTime[index] = time + minTime - arrivalTime[index];
        waitingTime[index] = turnAroundTime[index] - burstTime[index];
        totalWaitingTime += waitingTime[index];
        totalTurnAroundTime += turnAroundTime[index];
        output += `<li>Process ${index + 1}: Waiting Time = ${waitingTime[index]}, Turnaround Time = ${turnAroundTime[index]}</li>`;
    }

    let avgWaitingTime = totalWaitingTime / n;
    let avgTurnAroundTime = totalTurnAroundTime / n;

    output += `</ul><p>Average Waiting Time: ${avgWaitingTime.toFixed(2)}</p><p>Average Turnaround Time: ${avgTurnAroundTime.toFixed(2)}</p>`;

    document.get
