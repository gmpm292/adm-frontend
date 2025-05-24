export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };