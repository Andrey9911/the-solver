import * as fs from 'fs';
import path from 'path';

let array_data = [];
    const root_path = 'dataBase/category/'
    let dir_names = fs.readdirSync(root_path);
    
    console.log(" Filenames in directory:");
    let countAcc= 0;
    try{
        dir_names.forEach((sub_dir) => {
            console.log(`Filenames in directory: ${sub_dir}`);
            let account = new Object();
            account.name = sub_dir;
            account.content = [];

            let openedDir = fs.readdirSync(root_path + sub_dir);
            openedDir.forEach(sub_dir_name => {
                countAcc += 1;
                account.count = countAcc;
                account.content.push(`${sub_dir}_${countAcc}`)
                array_data.push(account);
                // console.log(array_data.filter(acc => acc.name === sub_dir));
                
            })
            
        });
    }catch(error){
        console.log('brooooo...');
        
    }

export function getTitleAccounts(){
    return [...new Set(array_data.map(acc => acc.name))];
}

export function getCountAccounts(title){
    return {
        count: array_data.filter(acc => acc.name === title).length
    }
}


export function saveOrderToFile(Id, purchaseCount) {
    // 1. Определение путей согласно иерархии: database/orders
    const ROOT_DIR = 'database/';
    const ORDERS_DIR = ROOT_DIR + 'orders/'; // "database/orders"
    const fileName = `${Id}.txt`;
    const filePath = ORDERS_DIR + fileName;

    // 2. Формирование содержимого файла
    const fileContent = 
`ID: ${Id}
Количество покупок: ${purchaseCount}`;

    try {
        // Запись данных в файл
        // writeFileSync синхронно записывает данные в файл.
        fs.writeFileSync(filePath, fileContent, 'utf8');
        // console.log(`Данные заказа ${Id} успешно сохранены в: ${filePath}`);

        return {
            success: true,
            message: `Файл ${fileName} сохранен.`,
            filePath: filePath
        };
        
    } catch (error) {
        // Обработка любых ошибок файловой системы
        console.error(`Ошибка при сохранении файла: ${error.message}`);
        return {
            success: false,
            message: `Ошибка при записи: ${error.message}`
        };
    }
}
export function SendFile(type,name,sub_type, purchaseCount){
    const Id = Date.now(); // Уникальный ID на основе текущего времени; 
    
    // Мы создадим фиктивный путь для примера
    const filePath = path.join('./database', type,sub_type, `${name}.txt`);
    
    // 2. Проверка существования файла
    if (!fs.existsSync(filePath)) {
        return {
            error:true,
            error_content: `Ошибка: Файл ID ${name} не найден по пути ${filePath}`
        } 
    }

    // 3. Отправка файла с помощью InputFil

    // removeFile(type, purchaseCount);
    return {
        error:false,
        path: filePath,

    }
}
export function removeFile(file_path){
    if (!fs.existsSync(file_path)) {
        return {
            error:true,
            error_content: `Ошибка: Файл ID ${name} не найден по пути ${file_path}.`
        } 
    }else{
        fs.unlink(file_path, err => {
            if (err) {
                console.error("Ошибка удаления:", err);
                return {
                    error:true, 
                    errorContent: error.code
                };
            }
        });
    }
}