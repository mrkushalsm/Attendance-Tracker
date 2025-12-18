import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../database/db';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKeyboard, faRobot, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const WelcomePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleModeSelect = async (mode) => {
        setLoading(true);
        try {
            await db.settings.put({ id: 'setupMode', value: mode });
            
            if (mode === 'manual') {
                // If Manual, go straight to adding subjects
                navigate('/attendance');
            } else {
                // If Auto, go to Settings to start the import process (or trigger it here later)
                // For now, let's redirect to settings with a query param or state to auto-open modal?
                // Actually, the plan says "Sets setupMode='auto', prompts File Upload".
                // Since the upload UI is complex, we'll redirect to a dedicated Import flow or Settings.
                // Re-reading plan: "Sets setupMode='auto', prompts File Upload".
                // Simplest V1: Redirect to Settings where the Import button is now visible.
                navigate('/settings?openImport=true'); 
            }
        } catch (error) {
            console.error("Error saving mode:", error);
            alert("Failed to save preference. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-6 text-base-content">
            <div className="max-w-2xl w-full text-center space-y-8">
                
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Welcome! 👋</h1>
                    <p className="text-lg opacity-70">How would you like to set up your subjects?</p>
                </div>

                {/* Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    
                    {/* Manual Mode Card */}
                    <button 
                        onClick={() => handleModeSelect('manual')}
                        disabled={loading}
                        className="card bg-base-200 hover:bg-base-300 transition-all duration-300 border-2 border-transparent hover:border-primary text-left group"
                    >
                        <div className="card-body">
                            <div className="w-12 h-12 rounded-xl bg-base-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <FontAwesomeIcon icon={faKeyboard} className="text-2xl text-primary" />
                            </div>
                            <h3 className="card-title">Manual Entry</h3>
                            <p className="opacity-70 text-sm">I'll type my subjects and schedule myself.</p>
                            <div className="card-actions justify-end mt-4">
                                <span className="btn btn-sm btn-ghost group-hover:btn-primary">Select <FontAwesomeIcon icon={faCheckCircle} /></span>
                            </div>
                        </div>
                    </button>

                    {/* Auto Mode Card */}
                    <button 
                        onClick={() => handleModeSelect('auto')}
                        disabled={loading}
                        className="card bg-base-200 hover:bg-base-300 transition-all duration-300 border-2 border-transparent hover:border-secondary text-left group"
                    >
                        <div className="card-body">
                            <div className="w-12 h-12 rounded-xl bg-base-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <FontAwesomeIcon icon={faRobot} className="text-2xl text-secondary" />
                            </div>
                            <h3 className="card-title">Smart Import</h3>
                            <p className="opacity-70 text-sm">Upload a picture of your timetable. AI will do the rest.</p>
                            <div className="card-actions justify-end mt-4">
                                <span className="btn btn-sm btn-ghost group-hover:btn-secondary text-secondary">Select <FontAwesomeIcon icon={faCheckCircle} /></span>
                            </div>
                        </div>
                    </button>

                </div>

                <p className="text-xs opacity-50 mt-8">
                    Don't worry, you can always change things later in Settings.
                </p>
            </div>
        </div>
    );
};

export default WelcomePage;
