# Testing Documentation

## Tổng quan

Dự án này sử dụng **Jest** làm testing framework chính kết hợp với **React Testing Library** để test React components và custom hooks.

## Cấu hình Jest

### File: `jest.config.js`

```javascript
export default {
  preset: "ts-jest", // Sử dụng preset ts-jest để hỗ trợ TypeScript
  testEnvironment: "jsdom", // Môi trường test giả lập DOM cho React
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"], // File setup chạy trước mỗi test
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.js" // Mock CSS files
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        // Transform TypeScript files
        tsconfig: "tsconfig.jest.json" // Sử dụng config TypeScript riêng cho Jest
      }
    ]
  },
  testMatch: [
    // Pattern để tìm test files
    "<rootDir>/src/**/__tests__/**/*.(ts|tsx)",
    "<rootDir>/src/**/*.(test|spec).(ts|tsx)"
  ],
  collectCoverageFrom: [
    // Files để tính coverage
    "src/**/*.(ts|tsx)",
    "!src/**/*.d.ts", // Loại trừ type definition files
    "!src/main.tsx", // Loại trừ entry point
    "!src/index.css", // Loại trừ CSS files
    "!src/__mocks__/**/*" // Loại trừ mock files
  ],
  coverageDirectory: "coverage", // Thư mục chứa báo cáo coverage
  coverageReporters: ["text", "lcov", "html"], // Format báo cáo coverage
  testTimeout: 10000, // Timeout cho mỗi test (10 giây)
  verbose: true, // Hiển thị chi tiết output
  extensionsToTreatAsEsm: [".ts", ".tsx"] // Treat TypeScript files as ES modules
};
```

### Giải thích các setting quan trọng:

#### 1. **preset: "ts-jest"**

- Cho phép Jest hiểu và chạy TypeScript files
- Tự động transform `.ts` và `.tsx` files

#### 2. **testEnvironment: "jsdom"**

- Tạo môi trường DOM giả lập trong Node.js
- Cần thiết để test React components (render, DOM queries)

#### 3. **setupFilesAfterEnv**

- Chạy file setup trước mỗi test suite
- Thường dùng để import testing utilities và setup global mocks

#### 4. **moduleNameMapper**

- Map CSS imports thành mock objects
- Tránh lỗi khi test components có import CSS

#### 5. **transform**

- Chỉ định cách transform files
- Sử dụng ts-jest với config TypeScript riêng

#### 6. **testMatch**

- Pattern để Jest tìm test files
- `__tests__` folders hoặc files có suffix `.test`/`.spec`

#### 7. **collectCoverageFrom**

- Chỉ định files nào cần tính coverage
- Loại trừ files không cần thiết (types, CSS, mocks)

## Cấu hình TypeScript cho Jest

### File: `tsconfig.jest.json`

```json
{
  "extends": "./tsconfig.json", // Kế thừa config chính
  "compilerOptions": {
    "module": "ESNext", // Sử dụng ES modules
    "moduleResolution": "node", // Resolve modules theo Node.js
    "allowImportingTsExtensions": false, // Không cho phép import .ts extensions
    "noEmit": false, // Cho phép emit files (Jest cần)
    "esModuleInterop": true, // Hỗ trợ import CommonJS modules
    "allowSyntheticDefaultImports": true // Cho phép default imports
  },
  "include": ["src/**/*"], // Include tất cả files trong src
  "exclude": ["node_modules"] // Loại trừ node_modules
}
```

## Các lệnh Test

### 1. **Chạy tất cả tests**

```bash
npm test
# hoặc
npm run test
```

- Chạy tất cả test files
- Hiển thị kết quả và coverage

### 2. **Chạy tests với watch mode**

```bash
npm run test:watch
```

- Chạy tests và watch file changes
- Tự động re-run khi có thay đổi
- Hữu ích khi development

### 3. **Chạy tests với coverage**

```bash
npm run test:coverage
```

- Chạy tests và tạo báo cáo coverage chi tiết
- Tạo HTML report trong thư mục `coverage/`

### 4. **Chạy tests trong CI environment**

```bash
npm run test:ci
```

- Chạy tests với CI mode
- Không có watch mode
- Tạo coverage report
- Thích hợp cho CI/CD pipelines

### 5. **Chạy Jest trực tiếp với options**

```bash
# Chạy với verbose output
npx jest --verbose

# Chạy specific test file
npx jest src/__tests__/integration.test.tsx

# Chạy tests matching pattern
npx jest --testNamePattern="should handle connection"

# Chạy với no cache
npx jest --no-cache

# Chạy với specific timeout
npx jest --testTimeout=5000
```

## Cấu trúc Test Files

### 1. **Test Files Location**

```
src/
├── __tests__/                    # Thư mục chứa test files
│   ├── integration.test.tsx      # Integration tests
│   ├── useMqtt.test.ts          # Hook tests
│   └── components.test.tsx       # Component tests
├── components/
│   ├── Header.tsx
│   └── MqttTest.tsx
└── hooks/
    └── useMqtt.ts
```

### 2. **Naming Convention**

- Test files: `*.test.ts` hoặc `*.spec.ts`
- Test folders: `__tests__`
- Integration tests: `integration.test.tsx`
- Unit tests: `*.test.ts`

## Types of Tests

### 1. **Unit Tests**

- Test individual functions, components, hooks
- Isolated testing với mocks
- Fast execution

### 2. **Integration Tests**

- Test interaction giữa multiple components
- Test complete user workflows
- Sử dụng real dependencies hoặc mocks

### 3. **Hook Tests**

- Test custom React hooks
- Sử dụng `@testing-library/react-hooks`
- Test state changes và side effects

## Testing Utilities

### 1. **React Testing Library**

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
```

### 2. **Jest DOM Matchers**

```typescript
import "@testing-library/jest-dom";
// Cung cấp matchers như toBeInTheDocument(), toHaveClass(), etc.
```

### 3. **Mock Functions**

```typescript
const mockFn = jest.fn();
const mockModule = jest.mock("./module");
```

## Best Practices

### 1. **Test Structure (AAA Pattern)**

```typescript
describe("Component", () => {
  it("should do something", () => {
    // Arrange - Setup test data
    const mockData = { id: 1, name: "Test" };

    // Act - Execute the action
    render(<Component data={mockData} />);

    // Assert - Verify the result
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

### 2. **Mocking**

- Mock external dependencies
- Mock API calls
- Mock timers và intervals

### 3. **Async Testing**

```typescript
it("should handle async operations", async () => {
  await userEvent.click(button);
  await waitFor(() => {
    expect(screen.getByText("Result")).toBeInTheDocument();
  });
});
```

### 4. **Cleanup**

- Jest tự động cleanup sau mỗi test
- Sử dụng `afterEach` nếu cần cleanup thêm

## Troubleshooting

### 1. **Common Issues**

- **Module not found**: Kiểm tra `moduleNameMapper` trong jest.config.js
- **TypeScript errors**: Kiểm tra `tsconfig.jest.json`
- **CSS import errors**: Đảm bảo có `styleMock.js`

### 2. **Performance**

- Sử dụng `--no-cache` nếu có vấn đề với cache
- Tách large test suites thành smaller ones
- Sử dụng `--maxWorkers` để control parallel execution

### 3. **Debugging**

```bash
# Debug specific test
npx jest --testNamePattern="test name" --verbose

# Debug với Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Coverage Reports

### 1. **HTML Report**

- Tạo trong `coverage/lcov-report/index.html`
- Hiển thị coverage theo files, functions, lines
- Có thể mở trong browser

### 2. **Text Report**

- Hiển thị trong terminal
- Tóm tắt coverage percentages

### 3. **LCOV Report**

- Format chuẩn cho CI/CD tools
- Có thể integrate với GitHub, GitLab, etc.

