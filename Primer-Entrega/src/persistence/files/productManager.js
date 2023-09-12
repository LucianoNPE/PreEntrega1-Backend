import fs from 'fs';

export class ProductManager{
    constructor(filePath) {
        this.filePath = filePath;
    }
    fileExist() {
        return fs.existsSync(this.filePath);
    }
    //Lee y trae los productos
    async getProducts() {
        try {
            if (this.fileExist()) {
                const data = await fs.promises.readFile(this.filePath, 'utf-8');
                //transfoma de string a json
                return JSON.parse(data);
            } else {
                throw new Error('No es posible leer el archivo');
            }
        } catch (error) {
            console.log(error.message)
            throw error;
        }
    }
    //Busca por id
    async getProductById(id){ 

        try {
            //leo el archivo
            const products = await this.getProducts();
            //busco por id
            const prodFound = products.find(prod => prod.id === id)
            if(prodFound) {
                return prodFound
                // console.log('Producto encontrado', prodFound);
            }
            else{
                throw new Error('Producto no encontrado');
            }
            
        } catch (error) {
            console.log(error.message);
            throw new Error ('Prducto inexistente')
        }

    }
    //Lee y agrega productos
    async createProduct(infoProduct) {
        try {
            //Verifico que los campos se carguen obligatoriamente
            if (!infoProduct.title || !infoProduct.description || !infoProduct.price || 
                !infoProduct.thumbnail || !infoProduct.code || !infoProduct.boolean || 
                !infoProduct.stock || !infoProduct.category) {
                throw new Error('Todos los campos son obligatorios');
            }
            const products = await this.getProducts();
            
            //Creo el id auto incremental
            let newId;
            if (products.length === 0) {
                newId = 1
            } else {
                newId = products[products.length - 1].id + 1;
            }
            
            //Si el codigo se repite no lo agrego
            const codeExist = products.some( prod => prod.code === infoProduct.code)
            if(codeExist){
                return "El codigo " + infoProduct.code + " ya existe, no será agregado"
            } else{
                infoProduct.id = newId
                products.push(infoProduct);
            }
            //Sobreescribo con el nuevo producto el archivo
            await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, '\t'));
            return infoProduct

            
        } catch (error) {
            throw error;
        }
    }

    //Metodo que actualiza
    async updateProduct(id, product) {
        try {
            const products = await this.getProducts();
            
            const updateIndex = products.findIndex(prod => prod.id === id);
    
            if (updateIndex === -1) {
                throw new Error('Producto no encontrado');
            }
    
            if (product.hasOwnProperty('id') && product.id !== id) {
                throw new Error('No puede modificarse el ID del producto.');
            }
            products[updateIndex] = {
                ...products[updateIndex],
                ...product
            };
    
            // Sobrescribir el JSON con los productos actualizados.
            await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, '\t'));
            console.log('Producto actualizado');
            return products[updateIndex];
        } catch (error) {
            console.log(error.message);
            throw new Error('Archivo inexistente o no se puede actualizar');
        }
    }

    //Metodo eliminar producto
    async deleteProduct(id) {
        try {
            const products = await this.getProducts()
            const existId = products.find(prod => prod.id === id)
            if(existId){
                const deleteId = products.filter(prod => prod.id !== id);
                await fs.promises.writeFile(this.filePath, JSON.stringify(deleteId, null, '\t'));
            } else {
                throw new Error('Producto no encontrado');
            }
        } catch (error) {
            console.log(error.message);
            throw new Error('Producto a eliminar inexistente');
        }
    }

}