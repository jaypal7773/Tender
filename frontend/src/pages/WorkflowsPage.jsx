import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const WorkflowsPage = () => {
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/workflows', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setWorkflows(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching workflows:', error);
            toast.error('Failed to load workflows');
            // Demo data for testing
            setWorkflows([
                {
                    _id: 'demo1',
                    tenderId: { title: 'IT Hardware Supply' },
                    companyId: { companyName: 'Tech Solutions' },
                    status: 'in_progress',
                    currentStep: 'document_preparation',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    _id: 'demo2',
                    tenderId: { title: 'Cloud Migration' },
                    companyId: { companyName: 'Cloud Experts' },
                    status: 'submitted',
                    currentStep: 'submission',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            not_started: '#6c757d',
            in_progress: '#ff9800',
            submitted: '#2196f3',
            awarded: '#4caf50',
            lost: '#f44336'
        };
        return colors[status] || '#6c757d';
    };

    const getStepLabel = (step) => {
        const steps = {
            discovery: 'Discovery',
            eligibility_check: 'Eligibility Check',
            document_preparation: 'Document Preparation',
            review: 'Review',
            submission: 'Submission',
            post_submission: 'Post Submission'
        };
        return steps[step] || step;
    };

    const getStepIndex = (step) => {
        const order = ['discovery', 'eligibility_check', 'document_preparation', 'review', 'submission', 'post_submission'];
        return order.indexOf(step) + 1;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                <p>Loading your workflows...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#333' }}>🔄 My Workflows</h1>

            {workflows.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <p style={{ color: '#666', marginBottom: '15px' }}>No workflows found.</p>
                    <button onClick={() => navigate('/tenders')} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Browse Tenders to Start
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {workflows.map((workflowItem) => (  // ← यहाँ workflowItem use kiya, workflow nahi
                        <div
                            key={workflowItem._id}
                            onClick={() => navigate(`/workflows/${workflowItem._id}`)}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '20px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                border: '1px solid #f0f0f0'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ marginBottom: '5px', fontSize: '18px' }}>{workflowItem.tenderId?.title || 'Unknown Tender'}</h3>
                                    <p style={{ color: '#666', marginBottom: '5px', fontSize: '14px' }}>
                                        Company: {workflowItem.companyId?.companyName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span style={{
                                        background: getStatusColor(workflowItem.status),
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '30px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {workflowItem.status?.replace(/_/g, ' ') || 'Not Started'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#666' }}>Current Step:</span>
                                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{getStepLabel(workflowItem.currentStep)}</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(getStepIndex(workflowItem.currentStep) / 6) * 100}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                        borderRadius: '10px'
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#999' }}>
                                    <span>Created: {new Date(workflowItem.createdAt).toLocaleDateString()}</span>
                                    <span>Updated: {new Date(workflowItem.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default WorkflowsPage;