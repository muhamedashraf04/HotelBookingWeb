namespace HotelBooking.Models.DTOs
{
    namespace HotelBooking.Contracts.Auth
    {
        public sealed record RegisterDto(string UserName, string Email, string? Password, string? PhoneNumber, float DicountLimit);
        public sealed record LoginDto(string UserName, string Password);
        public sealed record TokenResponse(string AccessToken, string RefreshToken, DateTime RefreshTokenExpiresAt, int UserId, string Role);
        public sealed record RefreshRequest(int UserId, string RefreshToken);
        public sealed record LogoutRequest();
    }

}
