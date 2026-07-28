export const getNBURates = async () => {
  try {
    const response = await fetch(
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'
    );
    if (!response.ok) throw new Error('Failed to fetch NBU rates');
    const data = await response.json();

    const usd = data.find((r: any) => r.cc === 'USD')?.rate || 41.25;
    const eur = data.find((r: any) => r.cc === 'EUR')?.rate || 45.1;

    return {
      base: 'UAH',
      rates: {
        UAH: 1,
        USD: 1 / usd,
        EUR: 1 / eur
      },
      updatedAt: new Date().toISOString(),
      provider: 'NBU API'
    };
  } catch (error) {
    console.error('Failed to fetch NBU rates:', error);
    return {
      base: 'UAH',
      rates: {
        UAH: 1,
        USD: 0.024,
        EUR: 0.022
      },
      updatedAt: new Date().toISOString(),
      provider: 'NBU API (Fallback)'
    };
  }
};
