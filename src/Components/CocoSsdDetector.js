import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

function CocoSsdDetector() {

    const [isShowVideo, setIsShowVideo] = useState(true);
    const webcamElement = useRef(null);
    const canvasRef = useRef(null);

    let refreshIntervalId = undefined;

    const startDetection = () => {
        cocoSsd.load().then(model => {
            const mdl = model;

            refreshIntervalId = setInterval(() => {
                detect(mdl);
            }, 10);
        });
    }

    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: "user"
    }

    const startCam = () => {
        setIsShowVideo(true);
    }

    const stopCam = () => {
        clearInterval(refreshIntervalId);

        let stream = webcamElement.current.stream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        setIsShowVideo(false);
    }

    const detect = async (model) => {
        if (webcamElement.current) {
            const video = webcamElement.current.video;

            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;

            console.log("detecting..")
            const obj = await model.detect(video);
            console.log(obj);

            const canv = canvasRef.current.getContext("2d");
            drawBoundingBox(obj, canv);
        }
    };

    const drawBoundingBox = (detections, canv) => {
        detections.forEach(prediction => {
            const [x, y, width, height] = prediction["bbox"];
            const text = prediction["class"];

            console.log(x, y, width, height);
            console.log(text);

            const color = "green";
            canv.strokeStyle = color;
            canv.font = "18px Arial";
            canv.fillStyle = color;

            canv.beginPath();
            canv.fillText(text, x, y);
            canv.rect(x, y, width, height);
            canv.stroke();
        })
    }

    return (
        <div>
            <button onClick={startCam}>Start Video</button>
            <button onClick={startDetection}>Detect</button>
            <button onClick={stopCam}>Stop Video</button>

            <div className="camView">
                {isShowVideo &&
                    <div>
                        <Webcam audio={false} ref={webcamElement} videoConstraints={videoConstraints}
                            style={{
                                position: "absolute",
                                marginLeft: "auto",
                                marginRight: "auto",
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                zindex: 9,
                                width: 640,
                                height: 480,
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            style={{
                                position: "absolute",
                                marginLeft: "auto",
                                marginRight: "auto",
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                zindex: 8,
                                width: 640,
                                height: 480
                            }}
                        />
                    </div>
                }
            </div>
        </div>
    );
};

export default CocoSsdDetector;