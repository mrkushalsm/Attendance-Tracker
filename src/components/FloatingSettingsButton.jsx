import { Link } from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCog} from "@fortawesome/free-solid-svg-icons";


const FloatingSettingsButton = () => {
    return (
        <Link
            to="/settings"
            className="fixed bottom-4 right-4 btn btn-circle btn-primary shadow-lg hover:scale-110 transition-transform"
        >
            <FontAwesomeIcon icon={faCog}/>
        </Link>
    );
};

export default FloatingSettingsButton;
