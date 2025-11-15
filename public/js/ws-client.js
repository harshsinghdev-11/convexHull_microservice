const socket = new WebSocket("ws://localhost:3000");

let currentStep = null;

socket.onopen = ()=>{
    console.log("Connected to WebSocket server");
}

socket.onmessage = (event)=>{
    if (typeof event.data === "string") {
    const msg = JSON.parse(event.data);
    currentStep = msg.step;
    return;
  }

  const blob = new Blob([event.data], { type: "image/png" });
  const url = URL.createObjectURL(blob);

  if (currentStep === 1) document.getElementById("step1").src = url;
  if (currentStep === 2) document.getElementById("step2").src = url;
  if (currentStep === 3) document.getElementById("step3").src = url;
  if (currentStep === 4) document.getElementById("step4").src = url;
};


document.getElementById("uploadInput").onchange = async (e)=>{
    const file = e.target.files[0];
    const buffer = await file.arrayBuffer();

    socket.send(buffer);
}