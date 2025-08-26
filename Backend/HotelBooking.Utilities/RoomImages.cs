using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace HotelBooking.Utilities
{
    public class RoomImages
    {
        private Cloudinary _cloudinary;

        public RoomImages(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }
        public string GetImagesFromFolder(string folderPath)
        {
            // Normalize: remove leading/trailing slashes, use forward slashes, add exactly one trailing slash
            var prefix = string.IsNullOrWhiteSpace(folderPath)
                ? ""
                : folderPath.Replace("\\", "/").Trim('/') + "/";

            var urls = new List<string>();

            var listParams = new ListResourcesByPrefixParams
            {
                Prefix = prefix,
                ResourceType = ResourceType.Image, // Only images
                Type = "upload",
                MaxResults = 500
            };

            ListResourcesResult result;
            do
            {
                result = _cloudinary.ListResources(listParams);

                if (result?.Resources != null)
                    urls.AddRange(result.Resources.Select(r => r.SecureUrl.ToString()));

                listParams.NextCursor = result?.NextCursor;
            }
            while (!string.IsNullOrEmpty(listParams.NextCursor));

            return string.Join(",", urls);
        }
    }
}
