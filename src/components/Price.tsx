import React from 'react';
import { useApp } from '../context/AppContext';

interface PriceProps {
    amount: number;
    className?: string;
}

export const Price: React.FC<PriceProps> = ({ amount, className = '' }) => {
    const { formatPrice } = useApp();
    return <span className={className}>{formatPrice(amount)}</span>;
};
