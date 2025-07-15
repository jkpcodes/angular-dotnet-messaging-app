using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    }
}
