/*
    Author: Horseface
    Date: 21/05/2022
*/

//#region Gamepad buttons config

prevButtons = [];
actions = [];
//allActions = [];
currentAPM = 0;
highestApm = [0, new Date()];
//#region Gamepad reading and setup
function process() {
    // Order goes GABK8462
    var vButtons = navigator.getGamepads();
    currentTime = new Date();

    // Exit if no gamepad is connected
    if (vButtons.length === 0) {
        console.log("No gamepad connected");
        requestAnimationFrame(process);
    }
    vButtons = vButtons[0]["buttons"];

    // Interpret controller state
    if (prevButtons.length === 0) {
        prevButtons = vButtons;
    }
    for (let i = 0; i < vButtons.length; i++) {
        if (
            vButtons[i]["pressed"] === true &&
            vButtons[i]["pressed"] !== prevButtons[i]["pressed"]
        ) {
            actions.push(currentTime);
        }
    }

    while (currentTime - actions[0] > 60000) {
        actions.shift();
    }
    currentAPM = actions.length;
    if (currentAPM > highestApm[0]) {
        highestApm = [currentAPM, currentTime];
        document.getElementById("HighestAPMParagraph").innerText = highestApm[0];
    }
    //console.log(currentAPM)

    prevButtons = vButtons;
    //renderItems(vBase);
    requestAnimationFrame(process);
}

function removeGamepad(gamepad) {
    console.log("Removed gamepad:", gamepad.index);
}

function handleConnect(e) {
    console.log("connected");
    console.log(e.gamepad);
    requestAnimationFrame(process);
}

function handleDisconnect(e) {
    console.log("disconnected");
    removeGamepad(e.gamepad);
}

window.addEventListener("gamepadconnected", handleConnect);
window.addEventListener("gamepaddisconnected", handleDisconnect);

//#endregion

//#region Display handeling

// Initialize Chart.js
keepValues = 5;
let data = {
    datasets: [
        {
            label: "Actions per minute",
            backgroundColor: "rgba(255, 255, 255, 1)",
            borderColor: "rgba(75, 192, 192, 1)",
            cubicInterpolationMode: "monotone",
            //borderDash: [8, 4],
            data: [],
            datalabels: {
                align: "start",
                anchor: "start",
            },
        },
    ],
};

const onRefresh = (chart) => {
    const now = Date.now();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push({
            x: now,
            y: currentAPM,
        });
    });
};


prevLabelValue = 0;
let config = {
    type: "line",
    data: data,
    plugins: [
        ChartDataLabels
    ],
    options: {
        scales: {
            x: {
                type: "realtime",
                realtime: {
                    duration: 60000,
                    refresh: 1000,
                    delay: 1500,
                    onRefresh: onRefresh,
                },
            },
            y: {
                title: {
                    display: true,
                    beginAtZero: true,
                    text: "Value",
                },
            },
        },
        interaction: {
            intersect: false,
        },
        plugins: {
            datalabels: {
                // Assume x axis has the realtime scale
                backgroundColor: (context) => context.dataset.borderColor,
                padding: 4,
                borderRadius: 4,
                clip: true, // true is recommended to keep labels running off the chart area
                color: "white",
                font: {
                    weight: "bold",
                    size: 20
                },
                //formatter: (value) => value.y,
                formatter: (value, context) => {
                    if(context.dataIndex === 0){
                        prevValue = 0;
                    }

                    if(context.dataset.data.length - context.dataIndex < 5){
                        if(prevValue === value.y){
                            return null;
                        }
                        prevValue = value.y;

                        return value.y;
                    } else {
                        return null;
                    }
                }
            },
        },
    },
};

const apmChart = new Chart(
    ctx, 
    config
);

// Update chart

//#endregion
