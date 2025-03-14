/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { CLASSIC_LOGIN } from '../graphql/queries';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading, error, data }] = useLazyQuery(CLASSIC_LOGIN, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error detallado:', {
        message: error.message,
        networkError: error.networkError,
        graphQLErrors: error.graphQLErrors,
        extraInfo: error.extraInfo,
      });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Iniciando login con:', { email, password });
    
    try {
      console.log('Enviando request...');
      const result = await login({
        variables: {
          input: {
            email,
            password,
          },
        },
      });
      
      console.log('Respuesta completa:', result);
      
      if (result.data?.classicLogin?.profile) {
        console.log('Login exitoso:', result.data.classicLogin.profile);
      }
    } catch (err) {
      console.error('Error en login:', {
        message: err.message,
        stack: err.stack,
        networkError: err.networkError,
        graphQLErrors: err.graphQLErrors,
      });
    }
  };

  return (
    <Card className="login-card">
      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="field">
          <span className="p-float-label">
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-inputtext-lg"
            />
            <label htmlFor="email">Email</label>
          </span>
        </div>
        
        <div className="field">
          <span className="p-float-label">
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              className="p-inputtext-lg"
              feedback={false}
            />
            <label htmlFor="password">Password</label>
          </span>
        </div>

        {error && (
          <Message 
            severity="error" 
            text={error.message || 'Error al iniciar sesión'}
            className="w-full mb-3"
          />
        )}

        <Button 
          type="submit" 
          label={loading ? 'Iniciando sesión...' : 'Iniciar sesión'} 
          icon="pi pi-sign-in" 
          loading={loading}
          className="p-button-lg"
        />
      </form>
    </Card>
  );
} 