const sql = require("mssql");
const dbConfig = require("../dbConfig");

class User {
    constructor(id, username, email, password_hash, created_at, role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password_hash = password_hash;
        this.created_at = created_at;
        this.role = role;
    }

    static async getAllUsers() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = "SELECT * FROM Users";
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset.map(
            (row) => new User(row.id, row.username, row.email, row.password_hash, row.created_at)
        );
    }

    static async getUserById(id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = "SELECT * FROM Users WHERE id=@id";
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0]
            ? new User(
                result.recordset[0].id,
                result.recordset[0].username,
                result.recordset[0].email,
                result.recordset[0].password_hash,
                result.recordset[0].created_at
            )
            : null;
    }

    static async createUser(user) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = "INSERT INTO Users (username, email, password_hash, created_at, role) VALUES(@username, @email, @password_hash, @created_at, @role); SELECT SCOPE_IDENTITY() AS id;";
    
        const request = connection.request();
        request.input("username", user.username);
        request.input("email", user.email);
        request.input("password_hash", user.password_hash);
        request.input("created_at", user.created_at);
        request.input("role", user.role);
    
        const result = await request.query(sqlQuery);
        connection.close();
    
        return new User(result.recordset[0].id, user.username, user.email, user.password_hash, user.created_at, user.role);
    }

    static async updateUser(id, user) {
        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('username', sql.NVarChar, user.username)
                .input('email', sql.NVarChar, user.email)
                .input('password_hash', sql.NVarChar, user.password_hash)
                .input('created_at', sql.DateTime, user.created_at)
                .query('UPDATE Users SET username = @username, email = @email, password_hash = @password_hash, created_at = @created_at WHERE id = @id');

            return { message: 'User updated successfully' };
        } catch (err) {
            console.error('Error updating user:', err);
            throw err;
        } finally {
            pool?.close();
        }
    }

    static async deleteUser(id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = "DELETE FROM Users WHERE id=@id";
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
        connection.close();

        return result.rowsAffected > 0;
    }

    static async getUserByEmail(email) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = "SELECT * FROM Users WHERE email = @email";
        const request = connection.request();
        request.input("email", email);
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0]
            ? new User(result.recordset[0].id, result.recordset[0].username, result.recordset[0].email, result.recordset[0].password_hash, result.recordset[0].created_at)
            : null;
    }
    
}

module.exports = User;