import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useApiData = <T>(
  fetchFn: () => Promise<T | null>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        toast.error('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, dependencies);

  return { data, loading, error };
};
