import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './OnboardingSurvey.css';

const OnboardingSurvey = ({ userId, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        university: '',
        graduation_year: '',
        primary_track: '',
        major: '',
        gpa: ''
    });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!skills.includes(skillInput.trim())) {
                setSkills([...skills, skillInput.trim()]);
            }
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (indexToRemove) => {
        setSkills(skills.filter((_, i) => i !== indexToRemove));
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        // 1. Update the user profile with structured educational metrics
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                university: formData.university,
                graduation_year: parseInt(formData.graduation_year),
                primary_track: formData.primary_track,
                major: formData.major,
                gpa: formData.gpa ? parseFloat(formData.gpa) : null,
                skills: skills
            })
            .eq('id', userId);

        if (profileError) {
            console.error("Onboarding upload error:", profileError.message);
            alert("Error saving profile details.");
            setSubmitting(false);
            return;
        }

        // 2. Grant them a 20 TC Sign-up data bonus for filling out their metrics!
        await supabase.rpc('grant_credits', {
            user_id: userId,
            amount: 20
        });

        setSubmitting(false);
        alert("Profile verified! +20 TC added to your institutional wallet.");
        onComplete(); // Closes the modal flow in App.jsx
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-modal">
                <div className="onboarding-progress">
                    <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}></div>
                    <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`progress-dot ${step === 3 ? 'active' : ''}`}></div>
                </div>

                {step === 1 && (
                    <div className="onboarding-step">
                        <h2>Verify Your Academic Core</h2>
                        <p>Trive relies on institutional validation. Tell us where you track.</p>

                        <div className="input-group">
                            <label>University / Institution</label>
                            <input
                                type="text" name="university" placeholder="e.g., NYU, Stanford, Cornell"
                                value={formData.university} onChange={handleInputChange}
                            />
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Major</label>
                                <input
                                    type="text" name="major" placeholder="e.g., Computer Science"
                                    value={formData.major} onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>Graduation Year</label>
                                <input
                                    type="number" name="graduation_year" placeholder="2027"
                                    value={formData.graduation_year} onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <button
                            className="onboard-next-btn"
                            disabled={!formData.university || !formData.major || !formData.graduation_year}
                            onClick={() => setStep(2)}
                        >
                            Continue Track Matching →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="onboarding-step">
                        <h2>Select Your Market Track</h2>
                        <p>This filters your feed and clusters you into active recruitment networks.</p>

                        <div className="input-group">
                            <label>Primary Recruiting Track</label>
                            <select name="primary_track" value={formData.primary_track} onChange={handleInputChange}>
                                <option value="">-- Choose Target Market --</option>
                                <option value="Software Engineering">Software Engineering (SWE)</option>
                                <option value="Quantitative Finance">Quantitative Finance / Trading</option>
                                <option value="Investment Banking">Investment Banking (IBD)</option>
                                <option value="Product Management">Product Management (PM)</option>
                                <option value="Data Science">Data Science / AI Research</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Cumulative GPA (Optional)</label>
                            <input
                                type="number" name="gpa" step="0.01" min="0" max="4.0" placeholder="3.85"
                                value={formData.gpa} onChange={handleInputChange}
                            />
                        </div>

                        <div className="button-group-row">
                            <button className="onboard-back-btn" onClick={() => setStep(1)}>Back</button>
                            <button
                                className="onboard-next-btn"
                                disabled={!formData.primary_track}
                                onClick={() => setStep(3)}
                            >
                                Final Step: Build Tech Stack →
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="onboarding-step">
                        <h2>Add Your Skills Stack</h2>
                        <p>Type a core skill or language (e.g., Python, Figma, Excel) and press **Enter**.</p>
                        <div className="input-group">
                            <label>Verified Institution Network</label>
                            <input
                                type="text"
                                name="university"
                                value={formData.university}
                                disabled // Locks the field so they can't manually spoof a different school
                                style={{ background: '#f1f5f9', color: '#475569', cursor: 'not-allowed' }}
                            />
                        </div>

                        <div className="skills-tag-container">
                            {skills.map((skill, index) => (
                                <span key={index} className="skill-tag">
                                    {skill}
                                    <button type="button" onClick={() => handleRemoveSkill(index)}>×</button>
                                </span>
                            ))}
                        </div>

                        <div className="button-group-row">
                            <button className="onboard-back-btn" onClick={() => setStep(2)}>Back</button>
                            <button className="onboard-submit-btn" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Initializing Vault...' : 'Claim Assets & Enter Exchange (+20 TC)'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingSurvey;