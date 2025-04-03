const Material = require('../Models/Material');

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

function createMaterialList(categories, parent_id = null) {
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
            children: createMaterialList(categories, cate._id),
        });
    }
    return categoryList;
}

class MaterialController {
    //[GET]
    async materialGet(req, res) {
        try {
            const dataMaterial = await Material.find({}).exec();
            if (dataMaterial) {
                const materialList = createMaterialList(dataMaterial);
                res.status(200).json({ material_list: materialList });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //[POST]
    async materialAdd(req, res) {
        try {
            const materialData = req.body;

            // Xử lý một material đơn lẻ
            if (!Array.isArray(materialData)) {
                const newMaterialData = {
                    name: materialData.name,
                    slug: createSlug(materialData.name),
                };
                const newMaterial = new Material(newMaterialData);
                const savedMaterial = await newMaterial.save();
                return res.status(200).json({
                    success: true,
                    message: 'Material added successfully',
                    data: savedMaterial,
                });
            }

            // Xử lý nhiều materials
            const savedMaterials = [];
            for (const material of materialData) {
                const newMaterialData = {
                    name: material.name,
                    slug: createSlug(material.name),
                };
                const newMaterial = new Material(newMaterialData);
                const data = await newMaterial.save();
                savedMaterials.push(data);
            }

            res.status(200).json({
                success: true,
                message: 'Materials added successfully',
                data: savedMaterials,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    //[PATCH]
    async materialUpdate(req, res) {
        try {
            const { id, name } = req.body;

            // Validate input
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID chất liệu là bắt buộc',
                });
            }

            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Tên chất liệu không được để trống',
                });
            }

            // Tìm chất liệu theo ID
            const material = await Material.findById(id);

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy chất liệu',
                });
            }

            // Cập nhật thông tin
            material.name = name;
            material.slug = createSlug(name);

            // Lưu vào database
            const updatedMaterial = await material.save();

            // Trả về kết quả thành công
            return res.status(200).json({
                success: true,
                message: 'Cập nhật chất liệu thành công',
                material: updatedMaterial,
            });
        } catch (error) {
            console.error('Lỗi cập nhật chất liệu:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật chất liệu',
                error: error.message,
            });
        }
    }
    //[DELETE]
    async materialDelete(req, res) {
        const { ids } = req.body;
        try {
            await Material.deleteMany({ _id: { $in: ids } });
            res.status(200).json({ message: 'Materials deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // [GET] Get all materials
    async getAllMaterials(req, res) {
        try {
            const materials = await Material.find({}).select('_id name slug');

            return res.status(200).json({
                success: true,
                data: materials,
            });
        } catch (error) {
            console.error('Error fetching all materials:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    }
}

module.exports = new MaterialController();
