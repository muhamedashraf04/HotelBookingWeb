using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBooking.Models.Models;

public class Customer
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    [Phone]
    public string PhoneNumber { get; set; }
    
    public string Address { get; set; }
    [Required]
    public string Nationality { get; set; }

    [Required]
    public string IdentificationType { get; set; }

    [Required]
    public string IdentificationNumber { get; set; }

    public string IdentificationAttachment { get; set; }

    [Required]
    public DateOnly BirthDate { get; set; }

    public int Age { get; set; }

    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public bool IsMarried { get; set; }

    public string? MarriageCertificateNumber { get; set; }

    public string? MarriageCertificateAttachment { get; set; }

    public string? MarriedToCustomerId { get; set; }
}
