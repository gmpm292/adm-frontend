import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGOUT } from '../../modules/auth/graphql/queries';
import '../styles/TopBar.css';

export function TopBar() {
    const navigate = useNavigate();
    const [logout] = useMutation(LOGOUT);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className="topbar">
            <div className="topbar-content">
                <div className="topbar-left">
                    <span className="app-name">Mi Aplicación</span>
                </div>
                <div className="topbar-right">
                    <Button 
                        label="Perfil" 
                        icon="pi pi-user" 
                        className="p-button-text" 
                        onClick={() => navigate('/profile')} 
                    />
                    <Button 
                        label="Idioma" 
                        icon="pi pi-globe" 
                        className="p-button-text" 
                        onClick={() => alert('Cambiar idioma')} 
                    />
                    <Button 
                        label="Cerrar Sesión" 
                        icon="pi pi-sign-out" 
                        className="p-button-text" 
                        onClick={handleLogout} 
                    />
                </div>
            </div>
        </div>
    );
}