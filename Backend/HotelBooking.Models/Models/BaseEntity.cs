using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBooking.Models.Models
{
    public abstract class BaseEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime createdAt { get; set; }

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime updatedAt { get; set; }

        [MaxLength(100)]
        public string? createdBy { get; set; }

        [MaxLength(100)]
        public string? updatedBy { get; set; }
    }
}
