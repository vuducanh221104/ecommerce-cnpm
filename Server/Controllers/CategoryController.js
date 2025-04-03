const Product = require('../Models/Product');
const Category = require('../Models/Category');

// Hàm tạo slug đơn giản
function createSlug(str) {
    // Chuyển thành chữ thường
    str = str.toLowerCase();

    // Thay thế các ký tự tiếng Việt
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');

    // Xóa ký tự đặc biệt
    str = str.replace(/[^a-z0-9 -]/g, '');

    // Xóa khoảng trắng thay bằng -
    str = str.replace(/\s+/g, '-');

    // Xóa các dấu - liên tiếp
    str = str.replace(/-+/g, '-');

    // Xóa các dấu - ở đầu và cuối
    str = str.replace(/^-+|-+$/g, '');

    return str;
}

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
                const newCategoryData = {
                    name: categoryData.name,
                    slug: createSlug(categoryData.name),
                };
                const newCategory = new Category(newCategoryData);
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
                const newCategoryData = {
                    name: category.name,
                    slug: createSlug(category.name),
                };
                const newCategory = new Category(newCategoryData);
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
        try {
            const { id, name } = req.body;

            // Validate input
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID danh mục là bắt buộc',
                });
            }

            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Tên danh mục không được để trống',
                });
            }

            // Tìm danh mục theo ID
            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy danh mục',
                });
            }

            // Cập nhật thông tin
            category.name = name;
            category.slug = createSlug(name);

            // Lưu vào database
            const updatedCategory = await category.save();

            // Trả về kết quả thành công
            return res.status(200).json({
                success: true,
                message: 'Cập nhật danh mục thành công',
                category: updatedCategory,
            });
        } catch (error) {
            console.error('Lỗi cập nhật danh mục:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật danh mục',
                error: error.message,
            });
        }
    }
    //[DELETE]
    async categoryDelete(req, res) {
        const { ids } = req.body;
        try {
            await Category.deleteMany({ _id: { $in: ids } });
            res.status(200).json({ message: 'Categories deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // [GET] Get all categories
    async getAllCategories(req, res) {
        try {
            const categories = await Category.find({}).select('_id name slug');

            return res.status(200).json({
                success: true,
                data: categories,
            });
        } catch (error) {
            console.error('Error fetching all categories:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    }
}
module.exports = new CategoryController();
