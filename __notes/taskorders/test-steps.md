
# Detailed Test Steps Documentation

## Next.js Setup Test
### Manual Test Procedure
1. Project Structure Verification
2. Directory Structure Validation
3. Build Test
4. Development Server Test
5. TypeScript Configuration Check

## Supabase Integration Test
1. Connection Test
2. Types Verification
3. Environment Test

## Development Environment Tests
1. Hot Reload Verification
2. Error Boundary Testing
3. Performance Testing
4. Build Process Verification

# Test Steps Documentation:
## Next.js Setup Test
### 수동 테스트 절차

1. 프로젝트 구조 확인
```bash
# 필수 파일/폴더 존재 확인
ls -la
# 확인할 항목:
# - src/app/ 디렉토리
# - next.config.js
# - package.json
# - tsconfig.json
```

2. 디렉토리 구조 검증
```bash
# src/app 디렉토리 구조 확인
ls -la src/app

# 필수 파일 존재 확인
[ -d "src/app" ] && echo "✅ src/app exists" || echo "❌ src/app not found"
[ -f "src/app/layout.tsx" ] && echo "✅ layout.tsx exists" || echo "❌ layout.tsx not found"
[ -f "src/app/page.tsx" ] && echo "✅ page.tsx exists" || echo "❌ page.tsx not found"
```

3. 빌드 테스트
```bash
# 프로덕션 빌드 실행
npm run build

# 빌드 결과물 확인
ls -la .next
```

4. 개발 서버 실행 및 확인
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
open http://localhost:3000
```

5. TypeScript 설정 확인
```bash
# TypeScript 컴파일 체크
npx tsc --noEmit
```

### 체크리스트
- [ ] src/app 디렉토리 구조 확인
- [ ] src/app/layout.tsx 파일 존재
- [ ] src/app/page.tsx 파일 존재
- [ ] 개발 서버 정상 작동
- [ ] 페이지 라우팅 정상 작동
- [ ] TypeScript 컴파일 오류 없음
- [ ] 콘솔 에러 없음

## Supabase Integration Test
```bash
# 1. Test connection
curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/

# 2. Verify types
npm run types:supabase

# 3. Test environment
echo $NEXT_PUBLIC_SUPABASE_URL
```

# Test Implementation Details:
## Initial Setup Tests

### 1. Setup Test Environment
```bash
# Install test dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom

# Create test configuration
touch jest.config.js
touch jest.setup.js
```

### 2. Test File Structure
```bash
mkdir -p tests/setup
touch tests/setup/next.test.ts
touch tests/setup/tailwind.test.ts
touch tests/setup/nextui.test.ts
touch tests/setup/supabase.test.ts
```

### 3. Configuration Files
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}

// jest.setup.js
import '@testing-library/jest-dom'
```

### 4. Test Implementation
```typescript
// tests/setup/next.test.ts
import fs from 'fs'
import path from 'path'

describe('Next.js Configuration', () => {
  test('src/app directory exists', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'src/app'))).toBe(true)
  })
  
  test('essential app files exist', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'src/app/layout.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'src/app/page.tsx'))).toBe(true)
  })
  
  test('next.config.js is valid', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'next.config.js'))).toBe(true)
  })
})

// tests/setup/supabase.test.ts
import { supabase } from '../../lib/supabase/client'

describe('Supabase Setup', () => {
  test('client is initialized', () => {
    expect(supabase).toBeDefined()
  })
  
  test('environment variables are loaded', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
  })
})
```

### 5. Run Tests
```bash
# Add test script to package.json
npm set-script test "jest"
npm set-script test:watch "jest --watch"

# Run tests
npm test
```

### 6. Visual Verification
- Start development server: `npm run dev`
- Visit http://localhost:3000
- Check browser console for errors
- Verify TailwindCSS classes are working
- Confirm NextUI components render correctly
- Test Supabase connection

### Test Steps Documentation
[View detailed test steps](./test-steps.md)

[View test implementation code](../tests/setup/)