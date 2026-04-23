import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const CompanyPage = () => {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [company, setCompany] = useState(null);
    const [formData, setFormData] = useState({});
    const [activeSection, setActiveSection] = useState('basic');

    useEffect(() => {
        fetchCompanyProfile();
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/company/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompany(response.data.data);
            setFormData(response.data.data);
        } catch (error) {
            console.error('Error fetching company:', error);
            setDemoData();
        } finally {
            setLoading(false);
        }
    };

    const setDemoData = () => {
        const demoCompany = {
            _id: 'demo',
            companyName: 'Tech Solutions India Pvt Ltd',
            registrationNumber: 'U72900MH2020PTC123456',
            gstin: '27AAACT1234F1Z',
            pan: 'AAACT1234F',
            financials: {
                annualTurnover: { current: 25000000, previous: 18000000 },
                netWorth: 5000000,
                profitAfterTax: 1500000
            },
            certifications: [
                { _id: 'cert1', name: 'ISO 9001:2015', certificateNumber: 'ISO/001', issuingAuthority: 'BSI', validUntil: '2026-12-31', isActive: true }
            ],
            pastProjects: [
                { _id: 'proj1', projectName: 'E-Procurement Portal', projectValue: 5000000, clientName: 'State Government', isSuccessful: true }
            ],
            operationalLocations: [
                { _id: 'loc1', state: 'Maharashtra', city: 'Mumbai', hasOffice: true, pincode: '400001' }
            ],
            teamCapabilities: { totalEmployees: 150, technicalStaff: 85, projectManagers: 12 }
        };
        setCompany(demoCompany);
        setFormData(demoCompany);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/company/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompany(response.data.data);
            setEditing(false);
            toast.success('Company profile updated!');
        } catch (error) {
            toast.error('Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading company profile...</div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>🏢 Company Profile</h1>
                <button onClick={() => setEditing(!editing)} style={{
                    padding: '10px 20px',
                    background: editing ? '#f44336' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}>
                    {editing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{company?.pastProjects?.length || 0}</div>
                    <div style={{ color: '#666' }}>Projects</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{company?.certifications?.length || 0}</div>
                    <div style={{ color: '#666' }}>Certifications</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{company?.operationalLocations?.length || 0}</div>
                    <div style={{ color: '#666' }}>Locations</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{company?.teamCapabilities?.totalEmployees || 0}</div>
                    <div style={{ color: '#666' }}>Employees</div>
                </div>
            </div>

            {/* Section Navigation */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['basic', 'financial', 'certifications', 'projects', 'locations', 'team'].map(section => (
                    <button key={section} onClick={() => setActiveSection(section)} style={{
                        padding: '8px 16px',
                        background: activeSection === section ? '#667eea' : '#f0f0f0',
                        color: activeSection === section ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                    }}>
                        {section === 'basic' && '📋 Basic'}
                        {section === 'financial' && '💰 Financial'}
                        {section === 'certifications' && '📜 Certifications'}
                        {section === 'projects' && '📁 Projects'}
                        {section === 'locations' && '📍 Locations'}
                        {section === 'team' && '👥 Team'}
                    </button>
                ))}
            </div>

            {/* Basic Information Section */}
            {activeSection === 'basic' && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '25px' }}>
                    <h3>Basic Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '20px' }}>
                        <div><label>Company Name</label><div>{company?.companyName}</div></div>
                        <div><label>Registration No</label><div>{company?.registrationNumber}</div></div>
                        <div><label>GSTIN</label><div>{company?.gstin}</div></div>
                        <div><label>PAN</label><div>{company?.pan}</div></div>
                    </div>
                </div>
            )}

            {/* Financial Section */}
            {activeSection === 'financial' && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '25px' }}>
                    <h3>Financial Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '20px' }}>
                        <div><label>Annual Turnover</label><div>{formatCurrency(company?.financials?.annualTurnover?.current)}</div></div>
                        <div><label>Previous Turnover</label><div>{formatCurrency(company?.financials?.annualTurnover?.previous)}</div></div>
                        <div><label>Net Worth</label><div>{formatCurrency(company?.financials?.netWorth)}</div></div>
                        <div><label>Profit After Tax</label><div>{formatCurrency(company?.financials?.profitAfterTax)}</div></div>
                    </div>
                </div>
            )}

            {/* Certifications Section */}
            {activeSection === 'certifications' && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '25px' }}>
                    <h3>Certifications</h3>
                    {company?.certifications?.map(cert => (
                        <div key={cert._id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                            <div><strong>{cert.name}</strong></div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Certificate: {cert.certificateNumber}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Valid Until: {new Date(cert.validUntil).toLocaleDateString()}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects Section */}
            {activeSection === 'projects' && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '25px' }}>
                    <h3>Past Projects</h3>
                    {company?.pastProjects?.map(project => (
                        <div key={project._id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                            <div><strong>{project.projectName}</strong></div>
                            <div>Client: {project.clientName}</div>
                            <div>Value: {formatCurrency(project.projectValue)}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Locations Section */}
            {activeSection === 'locations' && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '25px' }}>
                    <h3>Operational Locations</h3>
                    {company?.operationalLocations?.map(loc => (
                        <div key={loc._id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                            <div><strong>{loc.city}, {loc.state}</strong></div>
                            <div>Pincode: {loc.pincode}</div>
                            <div>{loc.hasOffice ? '🏢 Office Present' : '📍 Remote'}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Team Section */}
            {activeSection === 'team' && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '25px' }}>
                    <h3>Team Capabilities</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                        <div><label>Total Employees</label><div>{company?.teamCapabilities?.totalEmployees}</div></div>
                        <div><label>Technical Staff</label><div>{company?.teamCapabilities?.technicalStaff}</div></div>
                        <div><label>Project Managers</label><div>{company?.teamCapabilities?.projectManagers}</div></div>
                    </div>
                </div>
            )}

            {/* Save Button when editing */}
            {editing && (
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button onClick={handleSave} style={{
                        padding: '12px 30px',
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>Save All Changes</button>
                </div>
            )}
        </div>
    );
};

export default CompanyPage;