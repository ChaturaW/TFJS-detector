import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faVideoSlash, faBrain } from '@fortawesome/free-solid-svg-icons';

function CocoSsdDetector() {

    const [isShowVideo, setIsShowVideo] = useState(true);
    const [videoIcon, setVideoIcon] = useState(faVideoSlash);
    const [message, setMessage] = useState("");
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    let refreshIntervalId = undefined;

    const startDetection = () => {
        if (isShowVideo) {
            setMessage("Loading model. Please wait..")
            cocoSsd.load().then(model => {
                const mdl = model;

                refreshIntervalId = setInterval(() => {
                    detect(mdl);
                }, 10);
            });
        }
    }

    const videoConstraints = {
        facingMode: "environment"
    }

    const toggleCam = () => {
        if (isShowVideo) {
            clearInterval(refreshIntervalId);
            const tracks = webcamRef.current.stream.getTracks();
            tracks.forEach(track => track.stop());
            setIsShowVideo(false);
            setVideoIcon(faVideo);
        } else {
            setMessage("Turning on webcam..")
            setIsShowVideo(true);
            setVideoIcon(faVideoSlash);
        }
    }

    const detect = async (model) => {
        if ((webcamRef.current)
            && (webcamRef.current.video.readyState === 4)) {
            const video = webcamRef.current.video;

            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;

            console.log("detecting..")
            const detections = await model.detect(video);
            console.log(detections);

            const canv = canvasRef.current.getContext("2d");
            drawBoundingBox(detections, canv);
        }
    };

    const drawBoundingBox = (detections, canv) => {
        detections.forEach(prediction => {
            const [x, y, width, height] = prediction["bbox"];
            const text = prediction["class"];

            const color = "red";
            canv.strokeStyle = color;
            canv.font = "24px Arial";
            canv.fillStyle = color;

            canv.beginPath();
            canv.rect(x, y, width, height);
            canv.fillStyle = "white";
            canv.fillText(text, x, y - 10);
            canv.stroke();

            setMessage("");
        })
    }

    return (
        <div>
            <button onClick={toggleCam} className="webcamButton"><FontAwesomeIcon icon={videoIcon} size="3x" color="#464866" /></button>
            <button onClick={startDetection} className="detectButton"><FontAwesomeIcon icon={faBrain} size="3x" color="#2E9CCA" /></button>
            <p>{message}</p>
            <div className="bottomView">
                {isShowVideo &&
                    <div className="camView">
                        <div><Webcam audio={false} ref={webcamRef} videoConstraints={videoConstraints} className="webcam" /></div>
                        <div><canvas ref={canvasRef} className="canvas" /></div>
                    </div>
                }
            </div>
        </div>
    );
};

export default CocoSsdDetector;