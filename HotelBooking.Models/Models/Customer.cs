using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace HotelBooking.Models.Models;

public class Customer
{
    [Key]
    public string Id { get; set; }

    [Required]
    public string Name { get; set; }

    [Phone]
    public string PhoneNumber { get; set; }
    [ValidateNever]
    public string Address { get; set; }

    public string Nationality { get; set; }

    public string IdentificationType { get; set; }

    public string IdentificationNumber { get; set; }

    public string IdentificationAttachment { get; set; }

    public DateOnly BirthDate { get; set; }

    [EmailAddress]
    public string Email { get; set; }

    public bool IsMarried { get; set; }

    public string? MarriageCertificateNumber { get; set; }

    public string? MarriageCertificateAttachment { get; set; }

    public string? MarriedToCustomerId { get; set; }
}
