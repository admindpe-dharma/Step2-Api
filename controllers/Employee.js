
import Users from "../models/EmployeeModel.js"

export const ScanBadgeid = async (req, res) => {
    console.log(req.body);
    const { badgeId } = req.body;
    try {
        const user = await Users.findOne({ attributes: ['badgeId',"username"], where: { badgeId } });
        if (user) {
            res.json({ user: user });
        } else {
            res.json({ error: 'Badge ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server'  });
    }
};