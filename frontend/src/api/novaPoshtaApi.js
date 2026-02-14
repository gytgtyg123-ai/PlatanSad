// API для роботи з Новою Поштою
const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

// Реальний API ключ Нової Пошти
const API_KEY = '99f431ebd000e0b8f49d8fceb9669b4a';

/**
 * Пошук міст України (актуалізовано на 2026 рік)
 * @param {string} query - Назва міста для пошуку
 * @returns {Promise<Array>} Список міст
 */
export const searchCities = async (query) => {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          FindByString: query,
          Limit: '50',
          Language: 'UA'
        }
      })
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      // Фільтруємо тимчасово окуповані території (станом на 2026 рік)
      const occupiedRegions = [
        'Автономна Республіка Крим',
        'Севастопольська',
      ];
      
      // Список міст у тимчасово окупованих районах (оновлено 2026)
      const occupiedCities = [
        // Донецька область
        'Донецьк',
        'Макіївка',
        'Горлівка',
        'Єнакієве',
        'Дебальцеве',
        'Харцизьк',
        'Сніжне',
        'Торез',
        'Шахтарськ',
        'Ясинувата',
        'Іловайськ',
        'Амвросіївка',
        'Старобешеве',
        'Новоазовськ',
        'Тельманове',
        // Луганська область
        'Луганськ',
        'Алчевськ',
        'Краснодон',
        'Стаханов',
        'Ровеньки',
        'Красний Луч',
        'Брянка',
        'Антрацит',
        'Первомайськ',
        'Хрустальний',
        'Довжанськ',
        'Лутугине',
        'Молодогвардійськ'
      ];

      return data.data
        .filter(city => {
          // Виключаємо окуповані області (Крим)
          if (occupiedRegions.includes(city.AreaDescription)) {
            return false;
          }
          // Виключаємо окуповані міста
          if (occupiedCities.includes(city.Description)) {
            return false;
          }
          return true;
        })
        .map(city => ({
          ref: city.Ref,
          name: city.Description,
          nameRu: city.DescriptionRu,
          area: city.AreaDescription,
          region: city.RegionsDescription,
          deliveryCity: city.DeliveryCity
        }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

/**
 * Отримати відділення Нової Пошти в місті (включаючи поштомати)
 * @param {string} cityRef - Ref міста
 * @returns {Promise<Array>} Список відділень
 */
export const getWarehouses = async (cityRef) => {
  if (!cityRef) return [];

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: cityRef,
          Limit: '500',
          Language: 'UA'
        }
      })
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data
        // Виключаємо закриті відділення
        .filter(warehouse => warehouse.WarehouseStatus !== 'Closed')
        .map(warehouse => {
          // Визначаємо чи це поштомат за CategoryOfWarehouse
          const isPostomat = warehouse.CategoryOfWarehouse === 'Postomat';
          
          return {
            ref: warehouse.Ref,
            description: warehouse.Description,
            shortAddress: warehouse.ShortAddress,
            number: warehouse.Number,
            cityRef: warehouse.CityRef,
            typeOfWarehouse: warehouse.TypeOfWarehouse,
            categoryOfWarehouse: warehouse.CategoryOfWarehouse,
            warehouseStatus: warehouse.WarehouseStatus,
            isPostomat: isPostomat,
            // Не додаємо позначку до опису, вона буде в UI
            displayName: warehouse.Description
          };
        })
        // Сортуємо: спочатку відділення, потім поштомати
        .sort((a, b) => {
          // Спочатку відділення (Branch), потім поштомати (Postomat)
          if (a.isPostomat !== b.isPostomat) {
            return a.isPostomat ? 1 : -1;
          }
          // Всередині кожної групи сортуємо за номером
          const numA = parseInt(a.number) || 0;
          const numB = parseInt(b.number) || 0;
          return numA - numB;
        });
    }
    
    return [];
  } catch (error) {
    console.error('Error getting warehouses:', error);
    return [];
  }
};

/**
 * Популярні міста України для швидкого доступу (актуалізовано 2026)
 * Виключено окуповані міста
 */
export const popularCities = [
  'Київ',
  'Харків', 
  'Одеса',
  'Дніпро',
  'Львів',
  'Запоріжжя',
  'Кривий Ріг',
  'Миколаїв',
  'Маріуполь',
  'Вінниця',
  'Херсон',
  'Полтава',
  'Чернігів',
  'Черкаси',
  'Житомир',
  'Суми',
  'Хмельницький',
  'Рівне',
  'Чернівці',
  'Тернопіль',
  'Івано-Франківськ',
  'Луцьк',
  'Ужгород',
  'Кременчук',
  'Біла Церква',
  'Кропивницький',
  'Краматорськ',
  'Мелітополь',
  'Бердянськ'
];
