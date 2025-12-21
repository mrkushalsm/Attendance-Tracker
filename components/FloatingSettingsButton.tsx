import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

const FloatingSettingsButton = () => {
    return (
        <Link
            href="/settings"
            className="fixed bottom-4 right-4 btn btn-circle btn-primary shadow-lg hover:scale-110 transition-transform"
            style={{ zIndex: 999999, position: 'fixed', bottom: '1rem', right: '1rem' }}
        >
            <FontAwesomeIcon icon={faCog} />
        </Link>
    );
};

export default FloatingSettingsButton;
