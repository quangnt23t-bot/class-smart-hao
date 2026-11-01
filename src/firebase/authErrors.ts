/**
 * Maps Firebase Authentication error codes to user-friendly Vietnamese messages
 */
export function getFirebaseErrorMessage(error: any): string {
  if (!error) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';

  const code = typeof error === 'string' ? error : error?.code || error?.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký tài khoản. Vui lòng sử dụng email khác hoặc đăng nhập.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không đúng định dạng. Vui lòng kiểm tra lại.';
    case 'auth/operation-not-allowed':
      return 'Phương thức đăng nhập này chưa được kích hoạt trong Firebase Console. Vui lòng vào Firebase Console → Authentication → Sign-in method để bật nhà cung cấp (Email/Password hoặc Google).';
    case 'auth/weak-password':
      return 'Mật khẩu quá ngắn hoặc yếu. Vui lòng nhập mật khẩu có ít nhất 6 ký tự.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ ban quản trị.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.';
    case 'auth/wrong-password':
      return 'Mật khẩu không chính xác. Vui lòng thử lại.';
    case 'auth/invalid-credential':
      return 'Thông tin đăng nhập không hợp lệ hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
    case 'auth/too-many-requests':
      return 'Bạn đã thử đăng nhập sai quá nhiều lần. Quyền truy cập tạm thời bị khóa. Vui lòng thử lại sau vài phút.';
    case 'auth/popup-closed-by-user':
      return 'Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất xác thực.';
    case 'auth/popup-blocked':
      return 'Trình duyệt đã chặn cửa sổ bật lên (popup). Vui lòng cho phép popup để đăng nhập Google.';
    case 'auth/cancelled-popup-request':
      return 'Thao tác đăng nhập popup bị hủy do có yêu cầu mới.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng đến máy chủ Firebase. Vui lòng kiểm tra đường truyền Internet.';
    case 'auth/requires-recent-login':
      return 'Thao tác này yêu cầu đăng nhập lại gần đây. Vui lòng đăng xuất rồi đăng nhập lại.';
    case 'auth/missing-email':
      return 'Vui lòng nhập địa chỉ email.';
    case 'auth/missing-password':
      return 'Vui lòng nhập mật khẩu.';
    default:
      if (typeof error?.message === 'string' && error.message.includes('Firebase:')) {
        // Strip Firebase boilerplate if present
        return error.message.replace(/^Firebase:\s*/, '').replace(/\(auth\/.*?\)\.?/, '').trim();
      }
      return error?.message || 'Đã có lỗi xảy ra trong quá trình xác thực tài khoản.';
  }
}
