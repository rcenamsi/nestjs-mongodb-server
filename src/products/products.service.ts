import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product')
    private readonly productRepository: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const newProduct = new this.productRepository({
      title: createProductDto.title,
      description: createProductDto.description,
      price: createProductDto.price,
    });
    const result = await newProduct.save();
    return result.id as string;
  }

  async findAll() {
    const products = await this.productRepository.find().exec();
    return products.map((prod) => ({
      id: prod.id,
      title: prod.title,
      description: prod.description,
      price: prod.price,
    }));
  }

  async findOne(id: string) {
    const product = await this.findProduct(id);
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findProduct(id);

    if (updateProductDto.title) {
      product.title = updateProductDto.title;
    }
    if (updateProductDto.description) {
      product.description = updateProductDto.description;
    }
    if (updateProductDto.price) {
      product.price = updateProductDto.price;
    }
    product.save();
    return id;
  }

  async remove(id: string) {
    const result = await this.productRepository.deleteOne({ _id: id }).exec();
    if (result.deletedCount < 1) {
      throw new NotFoundException('Could not find product.');
    }
  }

  /**
   * PRIVATE
   **/

  private async findProduct(id: string): Promise<Product> {
    let product;
    try {
      product = await this.productRepository.findById(id);
    } catch (error) {
      throw new NotFoundException('Could not find product.');
    }
    if (!product) {
      throw new NotFoundException('Could not find product.');
    }

    return product;
  }
}
