<script lang="ts">
	import NavUser from '$lib/ui/blocks/nav-user.svelte';
	import { Label } from '$lib/ui/components/label/index.js';
	import { useSidebar } from '$lib/ui/components/sidebar/context.svelte.js';
	import * as Sidebar from '$lib/ui/components/sidebar/index.js';
	import { Switch } from '$lib/ui/components/switch/index.js';
	import Command from 'lucide-svelte/icons/command';

	import { data } from './data';

	import type { ComponentProps } from 'svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let activeItem = $state(data.navMain[0]);
	let mails = $state(data.mails);

	const sidebar = useSidebar();
</script>

<Sidebar.Root
	bind:ref
	collapsible="icon"
	class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
	{...restProps}
>
	<!-- This is the first sidebar -->
	<!-- We disable collapsible and adjust width to icon. -->
	<!-- This will make the sidebar appear as icons. -->
	<Sidebar.Root collapsible="none" class="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r">
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg" class="md:h-8 md:p-0">
						{#snippet child({ props })}
							<a href="##" {...props}>
								<div
									class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
								>
									<Command class="size-4" />
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-semibold">Acme Inc</span>
									<span class="truncate text-xs">Enterprise</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupContent class="px-1.5 md:px-0">
					<Sidebar.Menu>
						{#each data.navMain as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									tooltipContentProps={{
										hidden: false
									}}
									onclick={() => {
										activeItem = item;
										const mail = data.mails.sort(() => Math.random() - 0.5);
										mails = mail.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1));
										sidebar.setOpen(true);
									}}
									isActive={activeItem.title === item.title}
									class="px-2.5 md:px-2"
								>
									{#snippet tooltipContent()}
										{item.title}
									{/snippet}
									<item.icon />
									<span>{item.title}</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
		<Sidebar.Footer>
			<NavUser user={data.user} />
		</Sidebar.Footer>
	</Sidebar.Root>

	<!-- This is the second sidebar -->
	<!-- We disable collapsible and let it fill remaining space -->
	<Sidebar.Root collapsible="none" class="hidden flex-1 md:flex">
		<Sidebar.Header class="gap-3.5 border-b p-4">
			<div class="flex w-full items-center justify-between">
				<div class="text-foreground text-base font-medium">
					{activeItem.title}
				</div>
				<Label class="flex items-center gap-2 text-sm">
					<span>Unreads</span>
					<Switch class="shadow-none" />
				</Label>
			</div>
			<Sidebar.Input placeholder="Type to search..." />
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group class="p-0">
				<Sidebar.GroupContent>
					{#each mails as mail (mail.email)}
						<a
							href="##"
							class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0"
						>
							<div class="flex w-full items-center gap-2">
								<span>{mail.name}</span>{' '}
								<span class="ml-auto text-xs">{mail.date}</span>
							</div>
							<span class="font-medium">{mail.subject}</span>
							<span class="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
								{mail.teaser}
							</span>
						</a>
					{/each}
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
	</Sidebar.Root>
</Sidebar.Root>
