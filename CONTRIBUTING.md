# 🤝 Đóng góp vào dự án

## Quy trình đóng góp

### 1. Fork repository

### 2. Tạo branch mới

```bash
git checkout -b feature/ten-tinh-nang
```

### 3. Code và commit

```bash
git add .
git commit -m "feat: thêm tính năng XYZ"
```

### 4. Push và tạo Pull Request

```bash
git push origin feature/ten-tinh-nang
```

## Quy ước Commit

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật documentation
- `style:` - Format code (không ảnh hưởng logic)
- `refactor:` - Refactor code
- `test:` - Thêm tests
- `chore:` - Cập nhật dependencies, configs

**Ví dụ:**
```
feat: thêm chức năng chat trong game
fix: sửa lỗi không tính ELO đúng
docs: cập nhật hướng dẫn cài đặt
```

## Code Style

### JavaScript/React

- Sử dụng ES6+ syntax
- Arrow functions cho callbacks
- Destructuring khi có thể
- camelCase cho variables/functions
- PascalCase cho Components

### SQL

- UPPERCASE cho keywords
- snake_case cho table/column names
- Indent properly

### C

- snake_case cho functions/variables
- Comment đầy đủ
- Error handling cẩn thận

## Testing

Trước khi commit:

1. Test tất cả chức năng
2. Kiểm tra linter không có lỗi
3. Build thành công

## Pull Request

Template cho PR:

```markdown
## Mô tả
Mô tả ngắn gọn về thay đổi

## Loại thay đổi
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update

## Checklist
- [ ] Code đã được test
- [ ] Documentation đã cập nhật
- [ ] Không có breaking changes
```

## Code Review

Mọi PR cần được review trước khi merge.

## License

Bằng việc đóng góp, bạn đồng ý với MIT License của dự án.

