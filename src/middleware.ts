import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Đảm bảo biến môi trường JWT_SECRET đã được thiết lập
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Helper function để tạo một đối tượng chuyển hướng.
 */
function redirect(req: NextRequest, path: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = path;
  return NextResponse.redirect(url);
}

/**
 * Helper function để xóa cookie và chuyển hướng về trang đăng nhập.
 */
function clearCookieAndRedirect(req: NextRequest): NextResponse {
  const response = redirect(req, '/login');
  response.cookies.set('__session', '', { maxAge: 0 });
  return response;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('__session')?.value;
  const { pathname } = req.nextUrl;

  const isLoginPath = pathname.startsWith('/login');
  const isAdminPath = pathname.startsWith('/admin');
  const isSanityPath = pathname.startsWith('/sanity');

  // --- Logic chỉ áp dụng cho các trang /admin và /sanity ---
  if (isAdminPath || isSanityPath) {
    if (!token) {
      // Nếu không có token, chuyển hướng ngay đến trang đăng nhập.
      return redirect(req, '/login');
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      // Nếu truy cập trang admin hoặc sanity mà không có vai trò 'admin', chuyển hướng về trang chủ.
      if (payload.role !== 'admin') {
        return redirect(req, '/');
      }
      // Token hợp lệ và có quyền admin, cho phép truy cập.
      return NextResponse.next();
    } catch (error) {
      // Token không hợp lệ (sai, hết hạn...), xóa cookie và chuyển hướng đến trang đăng nhập.
      return clearCookieAndRedirect(req);
    }
  }

  // --- Logic cho người đã đăng nhập nhưng lại vào trang login ---
  if (isLoginPath && token) {
    try {
      await jwtVerify(token, secret);
      // Token hợp lệ, chuyển hướng họ về trang chủ.
      return redirect(req, '/');
    } catch (error) {
      console.log(
        error instanceof Error ? error.message : 'Something went wrong',
      );
      return NextResponse.next();
    }
  }

  // --- Cho phép tất cả các truy cập khác ---
  return NextResponse.next();
}

export const config = {
  // Matcher "catch-all" đảm bảo middleware chạy trên mọi trang.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
