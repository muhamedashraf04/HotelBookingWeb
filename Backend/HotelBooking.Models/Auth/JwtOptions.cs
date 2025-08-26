namespace HotelBooking.Models.Auth
{
    public sealed class JwtOptions
    {
        public string Issuer { get; init; } = default!;
        public string Audience { get; init; } = default!;
        public string Key { get; init; } = default!;
        public int AccessTokenMinutes { get; init; }
        public int RefreshTokenDays { get; init; }
    }
}
