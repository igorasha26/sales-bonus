/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    const { discount, sale_price, quantity } = purchase;
    const discountCoef = 1 - (discount / 100);

    return sale_price * quantity * discountCoef;
   // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;
    // @TODO: Расчет бонуса от позиции в рейтинге
    if (index === 0) {
        return profit * 0.15;
    } else if (index === 1 || index === 2) {
        return profit * 0.10;
    } else if (index === total - 1) {
        return 0;
    } else { // Для всех остальных
        return profit * 0.05;
    } 
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    const { calculateRevenue, calculateBonus } = options; // Сюда передадим функции для расчётов
    // @TODO: Проверка входных данных
    if (!data 
        || !Array.isArray(data.sellers)
        || !Array.isArray(data.customers)
        || !Array.isArray(data.products)
        || !Array.isArray(data.purchase_records)
        || data.sellers.length === 0
        || data.customers.length === 0
        || data.products.length === 0
        || data.purchase_records.length === 0
        ) {
    throw new Error('Некорректные входные данные');
    } 
    else {
        console.log("Все хорошо")
    }
    // @TODO: Проверка наличия опций
    if (!typeof calculateRevenue === "function" || !typeof calculateBonus == "function") {
        throw new Error('Чего-то не хватает');
    } 
    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        first_name: seller.first_name,
        last_name: seller.last_name,
        start_date: seller.start_date,
        position: seller.position,
        sales_count: 0,
        revenue: 0,
        profit: 0,
        bonus: 0,
        top_products: [],
        products_sold: {}
    }));
    console.log(sellerStats);
    
    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const someIndex = Object.fromEntries(sellerStats.map(seller => [seller.id, seller]));
    console.log(someIndex);

    const productIndex = Object.fromEntries(data.products.map(products => [products.sku, products]));
    console.log(productIndex);
    // @TODO: Расчет выручки и прибыли для каждого продавца

    data.purchase_records.forEach(record => { // Чек 
        const seller = someIndex[record.seller_id]; // Продавец
        seller.sales_count += 1;
        seller.revenue += record.total_amount;
        
        // Увеличить количество продаж 
        // Увеличить общую сумму выручки всех продаж

        // Расчёт прибыли для каждого товара
        record.items.forEach(item => {
            const product = productIndex[item.sku]; // Товар
            // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            let cost = product.purchase_price * item.quantity
            
            // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            let revenue = calculateRevenue(item, product);
            
            // Посчитать прибыль: выручка минус себестоимость
            let profit = revenue - cost;
            // Увеличить общую накопленную прибыль (profit) у продавца  
            seller.profit += profit;
            
            // Учёт количества проданных товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            // По артикулу товара увеличить его проданное количество у продавца
            seller.products_sold[item.sku] += item.quantity;
           
        });
    });
    
    // @TODO: Сортировка продавцов по прибыли
    const sorted = sellerStats.toSorted((a, b) => b.profit - a.profit);
    console.log(sorted);
    // @TODO: Назначение премий на основе ранжирования
    sorted.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sorted.length, seller);
        seller.top_products = Object.entries(seller.products_sold)
            .map(([sky, quantity]) => ({ sky, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10)
}); 
// console.log(someIndex)

    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sorted.map(seller => ({
    seller_id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2)
}));
}
