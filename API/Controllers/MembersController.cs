using API.Entities;
using API.Interfaces;
using API.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using API.Extensions;

namespace API.Controllers
{
    public class MembersController(IMemberRepository memberRepository) : BaseApiController
    {
        [Authorize]
        [HttpGet]
        public async Task<IReadOnlyList<Member>> GetMembers()
        {
            return await memberRepository.GetMembersAsync();
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Member>> GetMember(string id)
        {
            var member = await memberRepository.GetMemberByIdAsync(id);

            if (member == null) return NotFound();

            return member;
        }

        [Authorize]
        [HttpGet("{id}/photos")]
        public async Task<IReadOnlyList<Photo>> GetPhotosByMemberId(string id)
        {
            return await memberRepository.GetPhotosByMemberIdAsync(id);
        }

        [Authorize]
        [HttpPut]
        public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto)
        {
            var memberId = User.GetMemberId();

            var member = await memberRepository.GetMemberforUpdate(memberId);

            if (member == null) return BadRequest("Member not found.");

            member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
            member.Description = memberUpdateDto.Description ?? member.Description;
            member.City = memberUpdateDto.City ?? member.City;
            member.Country = memberUpdateDto.Country ?? member.Country;

            member.User.DisplayName = memberUpdateDto.DisplayName ?? member.User.DisplayName;

            // Set the member state to modified
            memberRepository.Update(member);

            if (await memberRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to update member.");
        }
    }
}
