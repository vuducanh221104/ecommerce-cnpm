const Product = require('../Models/Product');
const Category = require('../Models/Category');
function createCategoryList(categories, parent_id = null) {
    const categoryList = [];
    let category;
    if (parent_id === null) {
        category = categories.filter((cat) => cat.parent_id === undefined);
    } else {
        category = categories.filter((cat) => cat.parent_id && cat.parent_id.toString() === parent_id.toString());
    }
    for (let cate of category) {
        categoryList.push({
            _id: cate._id,
            name: cate.name,
            slug: cate.slug,
            children: createCategoryList(categories, cate._id),
        });
    }
    return categoryList;
}

class CategoryController {
    //[GET]
    async categoryAndQueryMaterial(req, res) {
        const categorySlug = req.params.slug || 'tat-ca-san-pham';
        let queryGfMaterial = req.query.gf_material;
        let queryGfAvailab = req.query.gf_availab;
        const sortBy = req.query.sort_by || 'price-asc';
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

        const limit = parseInt(req.query.limit) || 48;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        if (!queryGfMaterial) {
            queryGfMaterial = [];
        }

        if (!Array.isArray(queryGfMaterial)) {
            queryGfMaterial = [queryGfMaterial];
        }

        queryGfMaterial = queryGfMaterial.filter(Boolean);

        if (!queryGfAvailab) {
            queryGfAvailab = [];
        }

        if (!Array.isArray(queryGfAvailab)) {
            queryGfAvailab = [queryGfAvailab];
        }

        queryGfAvailab = queryGfAvailab.filter(Boolean);

        try {
            let products = await Product.find({})
                .populate({
                    path: 'material_id',
                    select: 'name parent_id slug',
                    populate: {
                        path: 'parent_id',
                        select: 'name slug',
                    },
                })
                .populate({
                    path: 'category_id',
                    select: 'name parent_id slug',
                    populate: {
                        path: 'parent_id',
                        select: 'name slug',
                    },
                })
                .exec();

            let category = null;

            if (categorySlug !== 'tat-ca-san-pham') {
                category = await Category.findOne({ slug: categorySlug }).exec();
                if (!category) {
                    return res.status(404).json({ message: 'Category not found' });
                }

                const matchesCategory = (product) => {
                    return product.category_id.some(
                        (category) =>
                            category.slug === categorySlug ||
                            (category.parent_id && category.parent_id.slug === categorySlug),
                    );
                };

                products = products.filter(matchesCategory);
            }

            // Apply price filters
            if (minPrice !== null) {
                products = products.filter((product) => product.price.original >= minPrice);
            }
            if (maxPrice !== null) {
                products = products.filter((product) => product.price.original <= maxPrice);
            }

            if (queryGfMaterial.length > 0) {
                products = products.filter((product) => {
                    const materialSlugs = product.material_id.map((material) => material.slug);
                    const parentMaterialSlugs = product.material_id
                        .map((material) => material.parent_id?.slug)
                        .filter(Boolean);
                    const allSlugs = [...materialSlugs, ...parentMaterialSlugs];

                    return queryGfMaterial.every((material) => allSlugs.includes(material));
                });
            }

            if (queryGfAvailab.includes('1')) {
                products = products.filter((product) => product.ship === 1);
            }

            // Apply sorting
            switch (sortBy) {
                case 'price-asc':
                    products.sort((a, b) => a.price.original - b.price.original);
                    break;
                case 'price-desc':
                    products.sort((a, b) => b.price.original - a.price.original);
                    break;
                case 'name-asc':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    products.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'date-asc':
                    products.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    break;
                case 'date-desc':
                    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                default:
                    break;
            }

            const totalItems = products.length;
            const totalPages = Math.ceil(totalItems / limit);
            const paginatedData = products.slice(skip, skip + limit);

            res.status(200).json({
                nameCategory: categorySlug === 'tat-ca-san-pham' ? 'Tất Cả Sản Phẩm' : category.name,
                totalItems,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
                data: paginatedData,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    //[GET]
    async categoryList(req, res) {
        try {
            const dataCategory = await Category.find({}).exec();
            if (dataCategory) {
                const categoryList = createCategoryList(dataCategory);
                res.json({ category_list: categoryList });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    //[POST]
    async categoryAdd(req, res) {
        try {
            const categoryData = req.body;

            // Xử lý một category đơn lẻ
            if (!Array.isArray(categoryData)) {
                const newCategory = new Category(categoryData);
                const savedCategory = await newCategory.save();
                return res.status(200).json({
                    success: true,
                    message: 'Category added successfully',
                    data: savedCategory,
                });
            }

            // Xử lý nhiều categories
            const savedCategories = [];
            for (const category of categoryData) {
                const newCategory = new Category(category);
                const data = await newCategory.save();
                savedCategories.push(data);
            }

            res.status(200).json({
                success: true,
                message: 'Categories added successfully',
                data: savedCategories,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    //[PATCH]
    async categoryUpdate(req, res) {
        const updatedCategory = req.body;
        try {
            // Use Promise.all to handle multiple updates
            const updatePromises = updatedCategory.map((category) => {
                return Category.findByIdAndUpdate(category._id, category, { new: true });
            });

            // Wait for all updates to complete
            const results = await Promise.all(updatePromises);

            res.json({ message: 'Materials updated successfully', results });
        } catch (error) {
            res.status(500).json({ message: 'Error updating materials', error });
        }
    }
    //[DELETE]
    async categoryDelete(req, res) {
        const { ids } = req.body;
        try {
            await Category.deleteMany({ _id: { $in: ids } });
            res.status(200).json({ message: 'Materials deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
module.exports = new CategoryController();
