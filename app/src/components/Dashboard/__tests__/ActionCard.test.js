import React from 'react';
import { render, screen } from '@testing-library/react';
import ActionCard from '../ActionCard';

describe('ActionCard', () => {
    const mockAction = {
        type: 'TREE_PLANTING',
        timestamp: '2024-01-15T10:30:00Z',
        location: {
            latitude: 37.7749,
            longitude: -122.4194,
            name: 'San Francisco Park'
        },
        details: {
            species: 'Oak',
            quantity: 3,
            soilCondition: 'good',
            weather: 'sunny'
        },
        impact: {
            carbonOffset: 22.5,
            waterRetention: 100.0,
            biodiversityScore: 15.0
        },
        verification: {
            isValid: true,
            confidenceScore: 0.95,
            verifiedAt: '2024-01-15T10:35:00Z',
            verificationMethod: 'GPS + Photo'
        }
    };

    it('renders action type and icon correctly', () => {
        render(<ActionCard action={mockAction} />);
        
        expect(screen.getByText('TREE PLANTING')).toBeInTheDocument();
        expect(screen.getByText('🌳')).toBeInTheDocument();
    });

    it('displays formatted date', () => {
        render(<ActionCard action={mockAction} />);
        
        const date = new Date(mockAction.timestamp);
        const formattedDate = date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });

    it('shows verification status correctly', () => {
        const { rerender } = render(<ActionCard action={mockAction} />);
        
        // Verified status
        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toHaveClass('verification-status verified');

        // Pending status
        const pendingAction = {
            ...mockAction,
            verification: {
                ...mockAction.verification,
                isValid: false,
                pendingReason: 'Awaiting review'
            }
        };
        rerender(<ActionCard action={pendingAction} />);
        
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toHaveClass('verification-status pending');
    });

    it('displays location information', () => {
        render(<ActionCard action={mockAction} />);
        
        expect(screen.getByText('San Francisco Park')).toBeInTheDocument();
        expect(screen.getByText('📍')).toBeInTheDocument();
    });

    it('shows coordinates when location name is not provided', () => {
        const actionWithoutLocationName = {
            ...mockAction,
            location: {
                latitude: 37.7749,
                longitude: -122.4194
            }
        };
        
        render(<ActionCard action={actionWithoutLocationName} />);
        
        expect(screen.getByText('37.7749, -122.4194')).toBeInTheDocument();
    });

    it('formats impact values correctly', () => {
        render(<ActionCard action={mockAction} />);
        
        expect(screen.getByText('22.50 kg')).toBeInTheDocument();
        expect(screen.getByText('100.00 L')).toBeInTheDocument();
        expect(screen.getByText('15.00')).toBeInTheDocument();
    });

    it('handles missing or invalid impact values', () => {
        const actionWithInvalidImpact = {
            ...mockAction,
            impact: {
                carbonOffset: null,
                waterRetention: undefined,
                biodiversityScore: 'invalid'
            }
        };
        
        render(<ActionCard action={actionWithInvalidImpact} />);
        
        expect(screen.getAllByText('N/A')).toHaveLength(3);
    });

    it('displays verification details correctly', () => {
        render(<ActionCard action={mockAction} />);
        
        expect(screen.getByText('Verification Details')).toBeInTheDocument();
        expect(screen.getByText('Method: GPS + Photo')).toBeInTheDocument();
        expect(screen.getByText('Confidence: 95.0%')).toBeInTheDocument();
    });

    it('shows pending reason when verification is pending', () => {
        const pendingAction = {
            ...mockAction,
            verification: {
                ...mockAction.verification,
                isValid: false,
                pendingReason: 'Awaiting photo verification'
            }
        };
        
        render(<ActionCard action={pendingAction} />);
        
        expect(screen.getByText('Pending: Awaiting photo verification')).toBeInTheDocument();
    });

    it('renders action details correctly', () => {
        render(<ActionCard action={mockAction} />);
        
        expect(screen.getByText('TREE PLANTING')).toBeInTheDocument();
        expect(screen.getByText('San Francisco Park')).toBeInTheDocument();
        expect(screen.getByText('species:')).toBeInTheDocument();
        expect(screen.getByText('Oak')).toBeInTheDocument();
        expect(screen.getByText('quantity:')).toBeInTheDocument();
        expect(screen.getByText('3.00')).toBeInTheDocument();
        expect(screen.getByText('soilCondition:')).toBeInTheDocument();
        expect(screen.getByText('good')).toBeInTheDocument();
        expect(screen.getByText('weather:')).toBeInTheDocument();
        expect(screen.getByText('sunny')).toBeInTheDocument();
    });

    it('handles actions without optional fields', () => {
        const minimalAction = {
            type: 'TREE_PLANTING',
            timestamp: '2024-01-15T10:30:00Z',
            impact: {
                carbonOffset: 22.5
            }
        };
        
        render(<ActionCard action={minimalAction} />);
        
        // Should still render without errors
        expect(screen.getByText('TREE PLANTING')).toBeInTheDocument();
        expect(screen.getByText('22.50 kg')).toBeInTheDocument();
        
        // Optional sections should not be present
        expect(screen.queryByText('Verification Details')).not.toBeInTheDocument();
        expect(screen.queryByText('📍')).not.toBeInTheDocument();
    });
});
