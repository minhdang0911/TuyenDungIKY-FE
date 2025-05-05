const Role = require('../Models/Role'); // Đảm bảo tên file model đúng

// Tạo role mới
exports.createRole = async (req, res) => {
  try {
    const { tenRole, mota } = req.body;
    const newRole = new Role({ tenRole, mota });
    await newRole.save();
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ message: 'Tạo role thất bại', error: error.message });
  }
};

// Lấy danh sách tất cả roles
// Lấy tất cả roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách role', error: error.message });
  }
};

// Lấy role theo ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    // Nếu không có role, trả về mảng rỗng thay vì lỗi 404
    if (!role) {
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: [], // Trả về mảng rỗng nếu không tìm thấy
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      data: role, // Trả về role nếu tìm thấy
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy role theo ID', error: error.message });
  }
};

// Cập nhật role
exports.updateRole = async (req, res) => {
  try {
    const { tenRole, mota } = req.body;
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { tenRole, mota },
      { new: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ message: 'Không tìm thấy role để cập nhật' });
    }
    res.status(200).json(updatedRole);
  } catch (error) {
    res.status(500).json({ message: 'Cập nhật role thất bại', error: error.message });
  }
};

// Xóa role
exports.deleteRole = async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ message: 'Không tìm thấy role để xóa' });
    }
    res.status(200).json({ message: 'Xóa role thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Xóa role thất bại', error: error.message });
  }
};
