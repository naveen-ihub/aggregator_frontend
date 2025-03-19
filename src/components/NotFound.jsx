
import Lottie from "lottie-react"
import notFoundAnimation from "../assets/not-found.json"; // Replace with your JSON file

const NotFoundAnimation = ({ title, message }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 w-full">
            <Lottie animationData={notFoundAnimation} loop={true} style={{ height: "400px" }} />
            <p className="text-5xl"> **{title}** </p>
            <p className="text-xl"> {message} </p>
        </div>
    );
};

export default NotFoundAnimation