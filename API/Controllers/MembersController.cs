using API.Entities;
using API.Interfaces;
using API.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Extensions;
using API.Helpers;

namespace API.Controllers
{
    public class MembersController(IUnitOfWork uow,
        IPhotoService photoService) : BaseApiController
    {
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<PaginatedResult<Member>>> GetMembers([FromQuery]MemberParams memberParams)
        {
            memberParams.CurrentMemberId = User.GetMemberId();

            return await uow.MemberRepository.GetMembersAsync(memberParams);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Member>> GetMember(string id)
        {
            var member = await uow.MemberRepository.GetMemberByIdAsync(id);

            if (member == null) return NotFound();

            return member;
        }

        [Authorize]
        [HttpGet("{id}/photos")]
        public async Task<IReadOnlyList<Photo>> GetPhotosByMemberId(string id)
        {
            return await uow.MemberRepository.GetPhotosByMemberIdAsync(id);
        }

        [Authorize]
        [HttpPut]
        public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto)
        {
            var memberId = User.GetMemberId();

            var member = await uow.MemberRepository.GetMemberforUpdate(memberId);

            if (member == null) return BadRequest("Member not found.");

            member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
            member.Description = memberUpdateDto.Description ?? member.Description;
            member.City = memberUpdateDto.City ?? member.City;
            member.Country = memberUpdateDto.Country ?? member.Country;

            member.User.DisplayName = memberUpdateDto.DisplayName ?? member.User.DisplayName;

            // Set the member state to modified
            uow.MemberRepository.Update(member);

            if (await uow.Complete()) return NoContent();

            return BadRequest("Failed to update member.");
        }

        [Authorize]
        [HttpPost("upload-photo")]
        public async Task<ActionResult<Photo>> UploadPhoto([FromForm]IFormFile file)
        {
            var member = await uow.MemberRepository.GetMemberforUpdate(User.GetMemberId());
            
            if (member == null) return BadRequest("Cannot upload photo.");

            var result = await photoService.UploadPhotoAsync(file);

            if (result.Error != null) return BadRequest(result.Error.Message);

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
                MemberId = User.GetMemberId()
            };

            // If the member has no photo, set the main photo to the newly uploaded photo
            if (member.ImageUrl == null)
            {
                member.ImageUrl = photo.Url;
                member.User.ImageUrl = photo.Url;
            }

            member.Photos.Add(photo);

            if (await uow.Complete()) return photo;

            return BadRequest("Problem adding photo.");
        }

        [Authorize]
        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var member = await uow.MemberRepository.GetMemberforUpdate(User.GetMemberId());

            if (member == null) return BadRequest("Member not found.");

            var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);

            if (photo == null) return BadRequest("Cannot set main photo.");

            member.ImageUrl = photo.Url;
            member.User.ImageUrl = photo.Url;

            if (await uow.Complete()) return NoContent();

            return BadRequest("Failed to set main photo.");
        }

        [Authorize]
        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var member = await uow.MemberRepository.GetMemberforUpdate(User.GetMemberId());

            if (member == null) return BadRequest("Member not found.");

            var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);

            // If the photo is not found or is the main photo, return a bad request
            if (photo == null || photo.Url == member.ImageUrl)
            {
                return BadRequest("Main photo cannot be deleted.");
            }

            // If the photo has a public id, delete it from Cloudinary
            if (photo.PublicId != null)
            {
                var result = await photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }

            member.Photos.Remove(photo);
            if (await uow.Complete()) return Ok();

            return BadRequest("Failed to delete photo.");
        }
    }
}
