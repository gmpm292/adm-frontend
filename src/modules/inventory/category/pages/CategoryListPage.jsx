import React from 'react';
import { Card } from 'primereact/card';
import { CategoryTable } from '../components/CategoryTable';
import '../styles/CategoryList.css';

export function CategoryListPage() {
    return (
        <div className="category-list-page">
            <Card title="Gestión de Categorías">
                <CategoryTable />
            </Card>
        </div>
    );
}